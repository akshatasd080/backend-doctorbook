/**
 * Prescriptions, medical reports, and patient medical history (Phase 6).
 */

const path = require('path');
const db = require('../models');
const AppError = require('../utils/AppError');
const chatService = require('./chatService');
const {
  HTTP_STATUS,
  ROLES,
  MESSAGE_TYPES,
  UPLOAD_CATEGORIES,
} = require('../constants');

const {
  User,
  DoctorProfile,
  Appointment,
  Prescription,
  MedicalReport,
  Conversation,
  Message,
  sequelize,
} = db;

async function assertDoctor(userId) {
  const user = await User.findByPk(userId);
  if (!user || user.role !== ROLES.DOCTOR) {
    throw new AppError('Only doctors can perform this action', HTTP_STATUS.FORBIDDEN);
  }
  return user;
}

async function assertPatientExists(patientUserId) {
  const patient = await User.findOne({
    where: { id: patientUserId, role: ROLES.PATIENT, isActive: true },
  });
  if (!patient) {
    throw new AppError('Patient not found', HTTP_STATUS.NOT_FOUND);
  }
  return patient;
}

async function uploadPrescription(doctorUserId, file, payload = {}, io = null) {
  await assertDoctor(doctorUserId);
  if (!file) {
    throw new AppError('Prescription file is required', HTTP_STATUS.BAD_REQUEST);
  }

  const patientUserId = Number(payload.patientUserId);
  if (!patientUserId) {
    throw new AppError('patientUserId is required', HTTP_STATUS.BAD_REQUEST);
  }
  await assertPatientExists(patientUserId);

  if (payload.appointmentId) {
    const appointment = await Appointment.findByPk(payload.appointmentId);
    if (!appointment) {
      throw new AppError('Appointment not found', HTTP_STATUS.NOT_FOUND);
    }
    const profile = await DoctorProfile.findOne({ where: { userId: doctorUserId } });
    if (
      appointment.patientUserId !== patientUserId ||
      appointment.doctorProfileId !== profile?.id
    ) {
      throw new AppError('Appointment does not match doctor/patient', HTTP_STATUS.BAD_REQUEST);
    }
  }

  const filePath = path.posix.join(
    '/uploads',
    UPLOAD_CATEGORIES.PRESCRIPTION,
    file.filename
  );

  const result = await sequelize.transaction(async (transaction) => {
    const prescription = await Prescription.create(
      {
        doctorUserId,
        patientUserId,
        appointmentId: payload.appointmentId || null,
        title: payload.title || 'Prescription',
        notes: payload.notes || null,
        filePath,
        prescribedAt: new Date(),
      },
      { transaction }
    );

    const conversation = await chatService.getOrCreateConversation(
      doctorUserId,
      patientUserId
    );

    const message = await Message.create(
      {
        conversationId: conversation.id,
        senderId: doctorUserId,
        messageType: MESSAGE_TYPES.PRESCRIPTION,
        content: payload.notes || payload.title || 'New prescription shared',
        filePath,
        prescriptionId: prescription.id,
        isRead: false,
      },
      { transaction }
    );

    await Conversation.update(
      { lastMessageAt: new Date() },
      { where: { id: conversation.id }, transaction }
    );

    return { prescription, conversation, message };
  });

  if (io) {
    io.to(`conversation:${result.conversation.id}`).emit('new_message', {
      ...result.message.toJSON(),
      prescription: result.prescription,
    });
  }

  return {
    prescription: result.prescription,
    conversationId: result.conversation.id,
    messageId: result.message.id,
  };
}

async function listPrescriptionsForUser(userId, role) {
  const where =
    role === ROLES.DOCTOR
      ? { doctorUserId: userId }
      : role === ROLES.PATIENT
        ? { patientUserId: userId }
        : {};

  return Prescription.findAll({
    where,
    include: [
      {
        model: User,
        as: 'doctor',
        attributes: ['id', 'fullName', 'email', 'profilePhoto'],
      },
      {
        model: User,
        as: 'patient',
        attributes: ['id', 'fullName', 'email', 'profilePhoto'],
      },
      {
        model: Appointment,
        as: 'appointment',
        required: false,
      },
    ],
    order: [['prescribedAt', 'DESC']],
  });
}

async function uploadMedicalReport(uploaderId, uploaderRole, file, payload = {}, io = null) {
  if (!file) {
    throw new AppError('Report file is required', HTTP_STATUS.BAD_REQUEST);
  }

  let patientUserId = Number(payload.patientUserId);
  if (uploaderRole === ROLES.PATIENT) {
    patientUserId = uploaderId;
  }
  if (!patientUserId) {
    throw new AppError('patientUserId is required', HTTP_STATUS.BAD_REQUEST);
  }
  await assertPatientExists(patientUserId);

  if (uploaderRole === ROLES.DOCTOR) {
    await assertDoctor(uploaderId);
  } else if (uploaderRole !== ROLES.PATIENT) {
    throw new AppError('Forbidden', HTTP_STATUS.FORBIDDEN);
  }

  const filePath = path.posix.join(
    '/uploads',
    UPLOAD_CATEGORIES.REPORT,
    file.filename
  );

  const report = await MedicalReport.create({
    uploadedBy: uploaderId,
    patientUserId,
    appointmentId: payload.appointmentId || null,
    title: payload.title || 'Medical Report',
    reportType: payload.reportType || 'general',
    filePath,
    notes: payload.notes || null,
  });

  // If doctor uploads for patient, also share in chat
  if (uploaderRole === ROLES.DOCTOR) {
    const conversation = await chatService.getOrCreateConversation(
      uploaderId,
      patientUserId
    );
    const message = await chatService.createMessage(conversation.id, uploaderId, {
      type: MESSAGE_TYPES.REPORT,
      content: payload.notes || payload.title || 'Medical report shared',
      filePath,
      medicalReportId: report.id,
    });

    if (io) {
      io.to(`conversation:${conversation.id}`).emit('new_message', message);
    }

    return { report, conversationId: conversation.id, messageId: message.id };
  }

  return { report };
}

async function listMedicalReports(userId, role, query = {}) {
  let where = {};

  if (role === ROLES.PATIENT) {
    where.patientUserId = userId;
  } else if (role === ROLES.DOCTOR) {
    where = query.patientUserId
      ? { patientUserId: Number(query.patientUserId) }
      : { uploadedBy: userId };
  } else if (role === ROLES.ADMIN) {
    if (query.patientUserId) where.patientUserId = Number(query.patientUserId);
  } else {
    throw new AppError('Forbidden', HTTP_STATUS.FORBIDDEN);
  }

  return MedicalReport.findAll({
    where,
    include: [
      {
        model: User,
        as: 'uploader',
        attributes: ['id', 'fullName', 'role', 'profilePhoto'],
      },
      {
        model: User,
        as: 'patient',
        attributes: ['id', 'fullName', 'email', 'profilePhoto'],
      },
    ],
    order: [['createdAt', 'DESC']],
  });
}

async function getMedicalHistory(patientUserId, requesterId, requesterRole) {
  if (requesterRole === ROLES.PATIENT && Number(patientUserId) !== Number(requesterId)) {
    throw new AppError('Forbidden', HTTP_STATUS.FORBIDDEN);
  }
  if (requesterRole === ROLES.DOCTOR) {
    await assertDoctor(requesterId);
  }

  await assertPatientExists(patientUserId);

  const [prescriptions, reports, appointments] = await Promise.all([
    listPrescriptionsForUser(patientUserId, ROLES.PATIENT),
    listMedicalReports(patientUserId, ROLES.PATIENT),
    Appointment.findAll({
      where: { patientUserId },
      include: [
        {
          model: DoctorProfile,
          as: 'doctorProfile',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullName', 'profilePhoto'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    }),
  ]);

  return {
    patientUserId: Number(patientUserId),
    prescriptions,
    reports,
    appointments,
  };
}

module.exports = {
  uploadPrescription,
  listPrescriptionsForUser,
  uploadMedicalReport,
  listMedicalReports,
  getMedicalHistory,
};
