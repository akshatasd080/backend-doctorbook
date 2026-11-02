/**
 * Admin service — doctor approval, listings, stats (Phase 3).
 */

const { Op } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/AppError');
const { serializeUser } = require('../utils/userSerializer');
const {
  HTTP_STATUS,
  ROLES,
  DOCTOR_APPROVAL_STATUS,
} = require('../constants');

const {
  User,
  DoctorProfile,
  DoctorDocument,
  PatientProfile,
  Specialization,
  Appointment,
} = db;

function doctorIncludes() {
  return [
    {
      model: User,
      as: 'user',
      attributes: { exclude: ['passwordHash'] },
    },
    {
      model: Specialization,
      as: 'specialization',
      required: false,
    },
    {
      model: DoctorDocument,
      as: 'documents',
      required: false,
    },
    {
      model: User,
      as: 'reviewer',
      attributes: ['id', 'fullName', 'email'],
      required: false,
    },
  ];
}

async function listDoctors(filters = {}) {
  const where = {};
  if (filters.status) {
    where.approvalStatus = filters.status;
  }
  if (filters.q) {
    // filtered via user include below using Op — handled with required user where
  }

  const userWhere = { role: ROLES.DOCTOR };
  if (filters.q) {
    userWhere[Op.or] = [
      { fullName: { [Op.iLike]: `%${filters.q}%` } },
      { email: { [Op.iLike]: `%${filters.q}%` } },
      { phone: { [Op.iLike]: `%${filters.q}%` } },
    ];
  }

  const doctors = await DoctorProfile.findAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: { exclude: ['passwordHash'] },
        where: userWhere,
      },
      {
        model: Specialization,
        as: 'specialization',
        required: false,
      },
      {
        model: DoctorDocument,
        as: 'documents',
        required: false,
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return doctors;
}

async function listPendingDoctors() {
  return listDoctors({ status: DOCTOR_APPROVAL_STATUS.PENDING });
}

async function getDoctorById(doctorProfileId) {
  const doctor = await DoctorProfile.findByPk(doctorProfileId, {
    include: doctorIncludes(),
  });

  if (!doctor) {
    throw new AppError('Doctor not found', HTTP_STATUS.NOT_FOUND);
  }

  return doctor;
}

async function approveDoctor(doctorProfileId, adminId) {
  const doctor = await getDoctorById(doctorProfileId);

  if (doctor.approvalStatus === DOCTOR_APPROVAL_STATUS.APPROVED) {
    throw new AppError('Doctor is already approved', HTTP_STATUS.BAD_REQUEST);
  }

  if (!doctor.submittedAt && doctor.approvalStatus === DOCTOR_APPROVAL_STATUS.PENDING) {
    // Allow approve even if not explicitly submitted, as long as profile exists
  }

  await doctor.update({
    approvalStatus: DOCTOR_APPROVAL_STATUS.APPROVED,
    rejectionReason: null,
    reviewedAt: new Date(),
    reviewedBy: adminId,
    submittedAt: doctor.submittedAt || new Date(),
  });

  return getDoctorById(doctorProfileId);
}

async function rejectDoctor(doctorProfileId, adminId, reason) {
  const doctor = await getDoctorById(doctorProfileId);

  if (doctor.approvalStatus === DOCTOR_APPROVAL_STATUS.REJECTED) {
    throw new AppError('Doctor is already rejected', HTTP_STATUS.BAD_REQUEST);
  }

  const rejectionReason = String(reason || '').trim();
  if (!rejectionReason) {
    throw new AppError('Rejection reason is required', HTTP_STATUS.BAD_REQUEST);
  }

  await doctor.update({
    approvalStatus: DOCTOR_APPROVAL_STATUS.REJECTED,
    rejectionReason,
    reviewedAt: new Date(),
    reviewedBy: adminId,
  });

  return getDoctorById(doctorProfileId);
}

async function listPatients(filters = {}) {
  const userWhere = { role: ROLES.PATIENT };
  if (filters.q) {
    userWhere[Op.or] = [
      { fullName: { [Op.iLike]: `%${filters.q}%` } },
      { email: { [Op.iLike]: `%${filters.q}%` } },
      { phone: { [Op.iLike]: `%${filters.q}%` } },
    ];
  }

  const patients = await User.findAll({
    where: userWhere,
    attributes: { exclude: ['passwordHash'] },
    include: [
      {
        model: PatientProfile,
        as: 'patientProfile',
        required: false,
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return patients.map((u) => serializeUser(u, { patientProfile: u.patientProfile }));
}

async function getStats() {
  const [
    totalDoctors,
    pendingDoctors,
    approvedDoctors,
    rejectedDoctors,
    totalPatients,
    totalAppointments,
    activeUsers,
    inactiveUsers,
  ] = await Promise.all([
    DoctorProfile.count(),
    DoctorProfile.count({ where: { approvalStatus: DOCTOR_APPROVAL_STATUS.PENDING } }),
    DoctorProfile.count({ where: { approvalStatus: DOCTOR_APPROVAL_STATUS.APPROVED } }),
    DoctorProfile.count({ where: { approvalStatus: DOCTOR_APPROVAL_STATUS.REJECTED } }),
    User.count({ where: { role: ROLES.PATIENT } }),
    Appointment.count(),
    User.count({ where: { isActive: true } }),
    User.count({ where: { isActive: false } }),
  ]);

  return {
    doctors: {
      total: totalDoctors,
      pending: pendingDoctors,
      approved: approvedDoctors,
      rejected: rejectedDoctors,
    },
    patients: { total: totalPatients },
    appointments: { total: totalAppointments },
    users: {
      active: activeUsers,
      inactive: inactiveUsers,
    },
  };
}

async function setUserActive(userId, isActive) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }
  if (user.role === ROLES.ADMIN) {
    throw new AppError('Cannot deactivate admin accounts', HTTP_STATUS.BAD_REQUEST);
  }

  await user.update({ isActive: Boolean(isActive) });
  return serializeUser(user);
}

module.exports = {
  listDoctors,
  listPendingDoctors,
  getDoctorById,
  approveDoctor,
  rejectDoctor,
  listPatients,
  getStats,
  setUserActive,
};
