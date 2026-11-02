/**
 * Appointment + availability slot service (Phase 4).
 */

const { Op } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/AppError');
const {
  HTTP_STATUS,
  ROLES,
  DOCTOR_APPROVAL_STATUS,
  APPOINTMENT_STATUS,
} = require('../constants');

const {
  User,
  DoctorProfile,
  AvailabilitySlot,
  Appointment,
  Specialization,
  sequelize,
} = db;

async function getDoctorProfileForUser(userId) {
  const profile = await DoctorProfile.findOne({ where: { userId } });
  if (!profile) {
    throw new AppError('Doctor profile not found', HTTP_STATUS.NOT_FOUND);
  }
  return profile;
}

async function createSlots(doctorUserId, payload) {
  const profile = await getDoctorProfileForUser(doctorUserId);

  if (profile.approvalStatus !== DOCTOR_APPROVAL_STATUS.APPROVED) {
    throw new AppError(
      'Only approved doctors can create slots',
      HTTP_STATUS.FORBIDDEN
    );
  }

  const slotsInput = Array.isArray(payload.slots) ? payload.slots : [payload];
  if (!slotsInput.length) {
    throw new AppError('At least one slot is required', HTTP_STATUS.BAD_REQUEST);
  }

  const created = [];
  for (const item of slotsInput) {
    const startTime = new Date(item.startTime);
    const endTime = new Date(item.endTime);

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw new AppError('Invalid startTime/endTime', HTTP_STATUS.BAD_REQUEST);
    }
    if (endTime <= startTime) {
      throw new AppError('endTime must be after startTime', HTTP_STATUS.BAD_REQUEST);
    }
    if (startTime < new Date()) {
      throw new AppError('Cannot create slots in the past', HTTP_STATUS.BAD_REQUEST);
    }

    const overlap = await AvailabilitySlot.findOne({
      where: {
        doctorProfileId: profile.id,
        isActive: true,
        startTime: { [Op.lt]: endTime },
        endTime: { [Op.gt]: startTime },
      },
    });
    if (overlap) {
      throw new AppError(
        `Overlapping slot exists around ${startTime.toISOString()}`,
        HTTP_STATUS.CONFLICT
      );
    }

    const slot = await AvailabilitySlot.create({
      doctorProfileId: profile.id,
      startTime,
      endTime,
      isBooked: false,
      isActive: true,
    });
    created.push(slot);
  }

  return created;
}

async function listSlotsForDoctor(doctorUserId, query = {}) {
  const profile = await getDoctorProfileForUser(doctorUserId);
  const where = { doctorProfileId: profile.id };

  if (query.available === 'true') {
    where.isBooked = false;
    where.isActive = true;
    where.startTime = { [Op.gte]: new Date() };
  }

  return AvailabilitySlot.findAll({
    where,
    order: [['startTime', 'ASC']],
  });
}

async function deleteSlot(doctorUserId, slotId) {
  const profile = await getDoctorProfileForUser(doctorUserId);
  const slot = await AvailabilitySlot.findOne({
    where: { id: slotId, doctorProfileId: profile.id },
  });

  if (!slot) {
    throw new AppError('Slot not found', HTTP_STATUS.NOT_FOUND);
  }
  if (slot.isBooked) {
    throw new AppError('Cannot delete a booked slot', HTTP_STATUS.BAD_REQUEST);
  }

  await slot.update({ isActive: false });
  return { id: Number(slotId), deleted: true };
}

async function bookAppointment(patientUserId, payload) {
  const slotId = Number(payload.slotId);
  if (!slotId) {
    throw new AppError('slotId is required', HTTP_STATUS.BAD_REQUEST);
  }

  return sequelize.transaction(async (transaction) => {
    const slot = await AvailabilitySlot.findByPk(slotId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!slot || !slot.isActive) {
      throw new AppError('Slot not available', HTTP_STATUS.NOT_FOUND);
    }
    if (slot.isBooked) {
      throw new AppError('Slot is already booked', HTTP_STATUS.CONFLICT);
    }
    if (new Date(slot.startTime) < new Date()) {
      throw new AppError('Cannot book a past slot', HTTP_STATUS.BAD_REQUEST);
    }

    const doctorProfile = await DoctorProfile.findByPk(slot.doctorProfileId, {
      transaction,
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'isActive'] }],
    });

    if (
      !doctorProfile ||
      doctorProfile.approvalStatus !== DOCTOR_APPROVAL_STATUS.APPROVED ||
      !doctorProfile.user?.isActive
    ) {
      throw new AppError('Doctor is not available for booking', HTTP_STATUS.BAD_REQUEST);
    }

    await slot.update({ isBooked: true }, { transaction });

    const appointment = await Appointment.create(
      {
        patientUserId,
        doctorProfileId: doctorProfile.id,
        slotId: slot.id,
        status: APPOINTMENT_STATUS.BOOKED,
        notes: payload.notes || null,
      },
      { transaction }
    );

    return Appointment.findByPk(appointment.id, {
      transaction,
      include: appointmentIncludes(),
    });
  });
}

function appointmentIncludes() {
  return [
    {
      model: User,
      as: 'patient',
      attributes: ['id', 'fullName', 'email', 'phone', 'profilePhoto'],
    },
    {
      model: DoctorProfile,
      as: 'doctorProfile',
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email', 'phone', 'profilePhoto'],
        },
        {
          model: Specialization,
          as: 'specialization',
          required: false,
        },
      ],
    },
    {
      model: AvailabilitySlot,
      as: 'slot',
    },
  ];
}

async function listForUser(userId, role, query = {}) {
  const where = {};
  if (query.status) where.status = query.status;

  if (role === ROLES.PATIENT) {
    where.patientUserId = userId;
  } else if (role === ROLES.DOCTOR) {
    const profile = await getDoctorProfileForUser(userId);
    where.doctorProfileId = profile.id;
  } else if (role !== ROLES.ADMIN) {
    throw new AppError('Forbidden', HTTP_STATUS.FORBIDDEN);
  }

  return Appointment.findAll({
    where,
    include: appointmentIncludes(),
    order: [[{ model: AvailabilitySlot, as: 'slot' }, 'startTime', 'DESC']],
  });
}

async function getById(appointmentId, userId, role) {
  const appointment = await Appointment.findByPk(appointmentId, {
    include: appointmentIncludes(),
  });

  if (!appointment) {
    throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND);
  }

  await assertCanAccessAppointment(appointment, userId, role);
  return appointment;
}

async function assertCanAccessAppointment(appointment, userId, role) {
  if (role === ROLES.ADMIN) return;

  if (role === ROLES.PATIENT && appointment.patientUserId === userId) return;

  if (role === ROLES.DOCTOR) {
    const profile = await getDoctorProfileForUser(userId);
    if (appointment.doctorProfileId === profile.id) return;
  }

  throw new AppError('Forbidden', HTTP_STATUS.FORBIDDEN);
}

async function updateStatus(appointmentId, userId, role, payload) {
  const appointment = await Appointment.findByPk(appointmentId, {
    include: [{ model: AvailabilitySlot, as: 'slot' }],
  });

  if (!appointment) {
    throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND);
  }

  await assertCanAccessAppointment(appointment, userId, role);

  const nextStatus = payload.status;
  const allowed = Object.values(APPOINTMENT_STATUS);
  if (!allowed.includes(nextStatus)) {
    throw new AppError('Invalid status', HTTP_STATUS.BAD_REQUEST);
  }

  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    throw new AppError('Appointment already cancelled', HTTP_STATUS.BAD_REQUEST);
  }
  if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
    throw new AppError('Appointment already completed', HTTP_STATUS.BAD_REQUEST);
  }

  if (nextStatus === APPOINTMENT_STATUS.CANCELLED) {
    await sequelize.transaction(async (transaction) => {
      await appointment.update(
        {
          status: APPOINTMENT_STATUS.CANCELLED,
          cancelledBy: role,
          cancelReason: payload.reason || null,
        },
        { transaction }
      );
      if (appointment.slot) {
        await appointment.slot.update(
          { isBooked: false },
          { transaction }
        );
      }
    });
  } else {
    // Patients can only cancel; doctors/admin can confirm/complete/no_show
    if (role === ROLES.PATIENT) {
      throw new AppError('Patients can only cancel appointments', HTTP_STATUS.FORBIDDEN);
    }
    await appointment.update({ status: nextStatus });
  }

  return getById(appointmentId, userId, role);
}

async function listAllForAdmin(query = {}) {
  return listForUser(null, ROLES.ADMIN, query);
}

module.exports = {
  createSlots,
  listSlotsForDoctor,
  deleteSlot,
  bookAppointment,
  listForUser,
  getById,
  updateStatus,
  listAllForAdmin,
};
