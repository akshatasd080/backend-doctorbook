/**
 * Auth service — register, login, password hashing (Phase 2).
 */

const { Op } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/password');
const { serializeUser } = require('../utils/userSerializer');
const {
  HTTP_STATUS,
  ROLES,
  DOCTOR_APPROVAL_STATUS,
} = require('../constants');

const { User, DoctorProfile, PatientProfile, Specialization, sequelize } = db;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizePhone(phone) {
  return String(phone || '').trim();
}

async function assertUniqueCredentials(email, phone, transaction) {
  const existing = await User.findOne({
    where: {
      [Op.or]: [{ email }, { phone }],
    },
    transaction,
  });

  if (!existing) return;

  if (existing.email === email) {
    throw new AppError('Email is already registered', HTTP_STATUS.CONFLICT);
  }

  throw new AppError('Phone number is already registered', HTTP_STATUS.CONFLICT);
}

async function resolveSpecializationId(payload, transaction) {
  if (payload.specializationId) {
    const byId = await Specialization.findByPk(payload.specializationId, {
      transaction,
    });
    if (!byId) {
      throw new AppError('Invalid specializationId', HTTP_STATUS.BAD_REQUEST);
    }
    return byId.id;
  }

  if (payload.specialization) {
    const byName = await Specialization.findOne({
      where: {
        name: { [Op.iLike]: String(payload.specialization).trim() },
      },
      transaction,
    });
    if (!byName) {
      throw new AppError(
        'Specialization not found. Use a valid name or specializationId.',
        HTTP_STATUS.BAD_REQUEST
      );
    }
    return byName.id;
  }

  return null;
}

function buildAuthResponse(user, extras = {}) {
  const token = signToken({
    id: user.id,
    role: user.role,
    email: user.email,
  });

  return {
    token,
    user: serializeUser(user, extras),
  };
}

async function registerPatient(payload) {
  const email = normalizeEmail(payload.email);
  const phone = normalizePhone(payload.phone);
  const fullName = String(payload.fullName || '').trim();

  if (!fullName || !email || !phone || !payload.password) {
    throw new AppError('Missing required fields', HTTP_STATUS.BAD_REQUEST);
  }

  return sequelize.transaction(async (transaction) => {
    await assertUniqueCredentials(email, phone, transaction);

    const passwordHash = await hashPassword(payload.password);

    const user = await User.create(
      {
        fullName,
        email,
        phone,
        passwordHash,
        role: ROLES.PATIENT,
        profilePhoto: payload.profilePhoto || null,
      },
      { transaction }
    );

    const patientProfile = await PatientProfile.create(
      {
        userId: user.id,
        dateOfBirth: payload.dateOfBirth || null,
        gender: payload.gender || null,
        bloodGroup: payload.bloodGroup || null,
        address: payload.address || null,
        emergencyContact: payload.emergencyContact || null,
        medicalHistorySummary: payload.medicalHistorySummary || null,
      },
      { transaction }
    );

    return buildAuthResponse(user, {
      patientProfile: {
        id: patientProfile.id,
        dateOfBirth: patientProfile.dateOfBirth,
        gender: patientProfile.gender,
        bloodGroup: patientProfile.bloodGroup,
        address: patientProfile.address,
        emergencyContact: patientProfile.emergencyContact,
        medicalHistorySummary: patientProfile.medicalHistorySummary,
      },
    });
  });
}

async function registerDoctor(payload) {
  const email = normalizeEmail(payload.email);
  const phone = normalizePhone(payload.phone);
  const fullName = String(payload.fullName || '').trim();

  if (!fullName || !email || !phone || !payload.password) {
    throw new AppError('Missing required fields', HTTP_STATUS.BAD_REQUEST);
  }

  return sequelize.transaction(async (transaction) => {
    await assertUniqueCredentials(email, phone, transaction);

    const specializationId = await resolveSpecializationId(payload, transaction);
    const passwordHash = await hashPassword(payload.password);

    const user = await User.create(
      {
        fullName,
        email,
        phone,
        passwordHash,
        role: ROLES.DOCTOR,
        profilePhoto: payload.profilePhoto || null,
      },
      { transaction }
    );

    const doctorProfile = await DoctorProfile.create(
      {
        userId: user.id,
        specializationId,
        qualifications: payload.qualifications || null,
        medicalRegistrationNumber: payload.medicalRegistrationNumber || null,
        yearsOfExperience:
          payload.yearsOfExperience !== undefined &&
          payload.yearsOfExperience !== null
            ? Number(payload.yearsOfExperience)
            : null,
        hospitalClinicName: payload.hospitalClinicName || null,
        hospitalClinicAddress: payload.hospitalClinicAddress || null,
        consultationFee:
          payload.consultationFee !== undefined &&
          payload.consultationFee !== null
            ? payload.consultationFee
            : null,
        bio: payload.bio || null,
        approvalStatus: DOCTOR_APPROVAL_STATUS.PENDING,
        submittedAt: null,
      },
      { transaction }
    );

    return buildAuthResponse(user, {
      doctorProfile: {
        id: doctorProfile.id,
        approvalStatus: doctorProfile.approvalStatus,
        specializationId: doctorProfile.specializationId,
        qualifications: doctorProfile.qualifications,
        medicalRegistrationNumber: doctorProfile.medicalRegistrationNumber,
        yearsOfExperience: doctorProfile.yearsOfExperience,
        hospitalClinicName: doctorProfile.hospitalClinicName,
        hospitalClinicAddress: doctorProfile.hospitalClinicAddress,
        consultationFee: doctorProfile.consultationFee,
        bio: doctorProfile.bio,
      },
    });
  });
}

async function login(payload) {
  const email = normalizeEmail(payload.email);
  const password = payload.password;

  if (!email || !password) {
    throw new AppError('Email and password are required', HTTP_STATUS.BAD_REQUEST);
  }

  const user = await User.findOne({
    where: { email },
    include: [
      {
        model: DoctorProfile,
        as: 'doctorProfile',
        required: false,
        include: [
          {
            model: Specialization,
            as: 'specialization',
            required: false,
          },
        ],
      },
      {
        model: PatientProfile,
        as: 'patientProfile',
        required: false,
      },
    ],
  });

  if (!user) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', HTTP_STATUS.FORBIDDEN);
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  const extras = {};
  if (user.role === ROLES.DOCTOR && user.doctorProfile) {
    extras.doctorProfile = user.doctorProfile;
  }
  if (user.role === ROLES.PATIENT && user.patientProfile) {
    extras.patientProfile = user.patientProfile;
  }

  return buildAuthResponse(user, extras);
}

async function getMe(userId) {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: DoctorProfile,
        as: 'doctorProfile',
        required: false,
        include: [
          {
            model: Specialization,
            as: 'specialization',
            required: false,
          },
          {
            model: db.DoctorDocument,
            as: 'documents',
            required: false,
          },
        ],
      },
      {
        model: PatientProfile,
        as: 'patientProfile',
        required: false,
      },
    ],
  });

  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', HTTP_STATUS.FORBIDDEN);
  }

  const extras = {};
  if (user.role === ROLES.DOCTOR) {
    extras.doctorProfile = user.doctorProfile;
  }
  if (user.role === ROLES.PATIENT) {
    extras.patientProfile = user.patientProfile;
  }

  return serializeUser(user, extras);
}

module.exports = {
  registerPatient,
  registerDoctor,
  login,
  getMe,
};
