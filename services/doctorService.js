/**
 * Doctor service — profile, documents, submit for review (Phase 3).
 */

const path = require('path');
const { Op } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/AppError');
const { serializeUser } = require('../utils/userSerializer');
const {
  HTTP_STATUS,
  ROLES,
  DOCTOR_APPROVAL_STATUS,
  UPLOAD_CATEGORIES,
} = require('../constants');

const {
  User,
  DoctorProfile,
  DoctorDocument,
  Specialization,
} = db;

const DOCUMENT_TYPES = new Set([
  'license',
  'degree',
  'id_proof',
  'registration',
  'other',
]);

async function findDoctorProfileByUserId(userId, options = {}) {
  const profile = await DoctorProfile.findOne({
    where: { userId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: {
          exclude: ['passwordHash'],
        },
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
    ...options,
  });

  if (!profile) {
    throw new AppError('Doctor profile not found', HTTP_STATUS.NOT_FOUND);
  }

  return profile;
}

async function resolveSpecializationId(payload) {
  if (payload.specializationId !== undefined && payload.specializationId !== null) {
    const byId = await Specialization.findByPk(payload.specializationId);
    if (!byId) {
      throw new AppError('Invalid specializationId', HTTP_STATUS.BAD_REQUEST);
    }
    return byId.id;
  }

  if (payload.specialization) {
    const byName = await Specialization.findOne({
      where: { name: { [Op.iLike]: String(payload.specialization).trim() } },
    });
    if (!byName) {
      throw new AppError('Specialization not found', HTTP_STATUS.BAD_REQUEST);
    }
    return byName.id;
  }

  return undefined;
}

function toPublicFilePath(category, filename) {
  return path.posix.join('/uploads', category, filename);
}

async function getProfile(userId) {
  const profile = await findDoctorProfileByUserId(userId);
  return {
    user: serializeUser(profile.user),
    doctorProfile: profile,
  };
}

async function updateProfile(userId, payload) {
  const profile = await findDoctorProfileByUserId(userId);

  if (profile.approvalStatus === DOCTOR_APPROVAL_STATUS.APPROVED) {
    // Approved doctors may still update clinical details; status stays approved.
  }

  const specializationId = await resolveSpecializationId(payload);

  const userUpdates = {};
  if (payload.fullName !== undefined) userUpdates.fullName = String(payload.fullName).trim();
  if (payload.phone !== undefined) userUpdates.phone = String(payload.phone).trim();
  if (payload.profilePhoto !== undefined) userUpdates.profilePhoto = payload.profilePhoto;

  if (Object.keys(userUpdates).length) {
    if (userUpdates.phone) {
      const phoneTaken = await User.findOne({
        where: {
          phone: userUpdates.phone,
          id: { [Op.ne]: userId },
        },
      });
      if (phoneTaken) {
        throw new AppError('Phone number is already registered', HTTP_STATUS.CONFLICT);
      }
    }
    await profile.user.update(userUpdates);
  }

  const profileUpdates = {};
  if (specializationId !== undefined) profileUpdates.specializationId = specializationId;
  if (payload.qualifications !== undefined) profileUpdates.qualifications = payload.qualifications;
  if (payload.medicalRegistrationNumber !== undefined) {
    profileUpdates.medicalRegistrationNumber = payload.medicalRegistrationNumber;
  }
  if (payload.yearsOfExperience !== undefined) {
    profileUpdates.yearsOfExperience = Number(payload.yearsOfExperience);
  }
  if (payload.hospitalClinicName !== undefined) {
    profileUpdates.hospitalClinicName = payload.hospitalClinicName;
  }
  if (payload.hospitalClinicAddress !== undefined) {
    profileUpdates.hospitalClinicAddress = payload.hospitalClinicAddress;
  }
  if (payload.consultationFee !== undefined) {
    profileUpdates.consultationFee = payload.consultationFee;
  }
  if (payload.bio !== undefined) profileUpdates.bio = payload.bio;

  // Editing after rejection puts them back to pending draft until re-submit
  if (
    Object.keys(profileUpdates).length &&
    profile.approvalStatus === DOCTOR_APPROVAL_STATUS.REJECTED
  ) {
    profileUpdates.approvalStatus = DOCTOR_APPROVAL_STATUS.PENDING;
    profileUpdates.rejectionReason = null;
    profileUpdates.submittedAt = null;
    profileUpdates.reviewedAt = null;
    profileUpdates.reviewedBy = null;
  }

  if (Object.keys(profileUpdates).length) {
    await profile.update(profileUpdates);
  }

  return getProfile(userId);
}

async function uploadDocument(userId, file, documentType = 'other') {
  if (!file) {
    throw new AppError('File is required', HTTP_STATUS.BAD_REQUEST);
  }

  const type = String(documentType || 'other').toLowerCase();
  if (!DOCUMENT_TYPES.has(type)) {
    throw new AppError(
      `Invalid documentType. Allowed: ${[...DOCUMENT_TYPES].join(', ')}`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const profile = await findDoctorProfileByUserId(userId);
  const filePath = toPublicFilePath(UPLOAD_CATEGORIES.DOCUMENT, file.filename);

  const document = await DoctorDocument.create({
    doctorProfileId: profile.id,
    documentType: type,
    filePath,
    originalName: file.originalname,
    mimeType: file.mimetype,
  });

  return document;
}

async function listDocuments(userId) {
  const profile = await findDoctorProfileByUserId(userId);
  return profile.documents || [];
}

async function deleteDocument(userId, documentId) {
  const profile = await findDoctorProfileByUserId(userId);
  const document = await DoctorDocument.findOne({
    where: {
      id: documentId,
      doctorProfileId: profile.id,
    },
  });

  if (!document) {
    throw new AppError('Document not found', HTTP_STATUS.NOT_FOUND);
  }

  await document.destroy();
  return { id: Number(documentId), deleted: true };
}

async function submitForReview(userId) {
  const profile = await findDoctorProfileByUserId(userId);

  if (profile.approvalStatus === DOCTOR_APPROVAL_STATUS.APPROVED) {
    throw new AppError('Doctor is already approved', HTTP_STATUS.BAD_REQUEST);
  }

  const missing = [];
  if (!profile.specializationId) missing.push('specialization');
  if (!profile.medicalRegistrationNumber) missing.push('medicalRegistrationNumber');
  if (!profile.qualifications) missing.push('qualifications');
  if (profile.yearsOfExperience === null || profile.yearsOfExperience === undefined) {
    missing.push('yearsOfExperience');
  }
  if (!profile.consultationFee) missing.push('consultationFee');

  const docs = profile.documents || [];
  if (!docs.length) missing.push('at least one verification document');

  if (missing.length) {
    throw new AppError(
      `Cannot submit for review. Missing: ${missing.join(', ')}`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  await profile.update({
    approvalStatus: DOCTOR_APPROVAL_STATUS.PENDING,
    submittedAt: new Date(),
    rejectionReason: null,
    reviewedAt: null,
    reviewedBy: null,
  });

  return getProfile(userId);
}

async function updateProfilePhoto(userId, file) {
  if (!file) {
    throw new AppError('File is required', HTTP_STATUS.BAD_REQUEST);
  }

  const user = await User.findOne({ where: { id: userId, role: ROLES.DOCTOR } });
  if (!user) {
    throw new AppError('Doctor not found', HTTP_STATUS.NOT_FOUND);
  }

  const filePath = toPublicFilePath(UPLOAD_CATEGORIES.PROFILE, file.filename);
  await user.update({ profilePhoto: filePath });
  return getProfile(userId);
}

module.exports = {
  getProfile,
  updateProfile,
  uploadDocument,
  listDocuments,
  deleteDocument,
  submitForReview,
  updateProfilePhoto,
  DOCUMENT_TYPES,
};
