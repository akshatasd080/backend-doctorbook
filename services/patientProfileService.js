/**
 * Patient profile management.
 */

const db = require('../models');
const AppError = require('../utils/AppError');
const { serializeUser } = require('../utils/userSerializer');
const { HTTP_STATUS, ROLES } = require('../constants');

const { User, PatientProfile } = db;

async function getProfile(userId) {
  const user = await User.findOne({
    where: { id: userId, role: ROLES.PATIENT },
    attributes: { exclude: ['passwordHash'] },
    include: [{ model: PatientProfile, as: 'patientProfile' }],
  });

  if (!user) {
    throw new AppError('Patient not found', HTTP_STATUS.NOT_FOUND);
  }

  return serializeUser(user, { patientProfile: user.patientProfile });
}

async function updateProfile(userId, payload) {
  const user = await User.findOne({
    where: { id: userId, role: ROLES.PATIENT },
    include: [{ model: PatientProfile, as: 'patientProfile' }],
  });

  if (!user) {
    throw new AppError('Patient not found', HTTP_STATUS.NOT_FOUND);
  }

  if (payload.fullName) await user.update({ fullName: String(payload.fullName).trim() });
  if (payload.phone) await user.update({ phone: String(payload.phone).trim() });
  if (payload.profilePhoto !== undefined) {
    await user.update({ profilePhoto: payload.profilePhoto });
  }

  let profile = user.patientProfile;
  if (!profile) {
    profile = await PatientProfile.create({ userId: user.id });
  }

  await profile.update({
    dateOfBirth:
      payload.dateOfBirth !== undefined ? payload.dateOfBirth : profile.dateOfBirth,
    gender: payload.gender !== undefined ? payload.gender : profile.gender,
    bloodGroup:
      payload.bloodGroup !== undefined ? payload.bloodGroup : profile.bloodGroup,
    address: payload.address !== undefined ? payload.address : profile.address,
    emergencyContact:
      payload.emergencyContact !== undefined
        ? payload.emergencyContact
        : profile.emergencyContact,
    medicalHistorySummary:
      payload.medicalHistorySummary !== undefined
        ? payload.medicalHistorySummary
        : profile.medicalHistorySummary,
  });

  return getProfile(userId);
}

module.exports = {
  getProfile,
  updateProfile,
};
