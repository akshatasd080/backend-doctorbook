/**
 * Patient service — browse approved doctors (Phase 3 visibility gate + Phase 4 browse).
 */

const { Op } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/AppError');
const {
  HTTP_STATUS,
  DOCTOR_APPROVAL_STATUS,
} = require('../constants');

const {
  User,
  DoctorProfile,
  Specialization,
  AvailabilitySlot,
} = db;

async function listApprovedDoctors(filters = {}) {
  const profileWhere = {
    approvalStatus: DOCTOR_APPROVAL_STATUS.APPROVED,
  };

  const userWhere = { isActive: true };
  if (filters.q || filters.name) {
    const term = filters.q || filters.name;
    userWhere.fullName = { [Op.iLike]: `%${term}%` };
  }

  const specializationInclude = {
    model: Specialization,
    as: 'specialization',
    required: false,
  };

  if (filters.specialization) {
    specializationInclude.required = true;
    specializationInclude.where = {
      name: { [Op.iLike]: `%${filters.specialization}%` },
    };
  }

  if (filters.specializationId) {
    profileWhere.specializationId = Number(filters.specializationId);
  }

  const doctors = await DoctorProfile.findAll({
    where: profileWhere,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email', 'phone', 'profilePhoto', 'isActive'],
        where: userWhere,
      },
      specializationInclude,
    ],
    order: [['consultationFee', 'ASC']],
  });

  return doctors.map((d) => ({
    id: d.id,
    userId: d.userId,
    fullName: d.user.fullName,
    profilePhoto: d.user.profilePhoto,
    specialization: d.specialization
      ? { id: d.specialization.id, name: d.specialization.name }
      : null,
    qualifications: d.qualifications,
    yearsOfExperience: d.yearsOfExperience,
    hospitalClinicName: d.hospitalClinicName,
    consultationFee: d.consultationFee,
    bio: d.bio,
  }));
}

async function getDoctorPublicProfile(doctorProfileId) {
  const doctor = await DoctorProfile.findOne({
    where: {
      id: doctorProfileId,
      approvalStatus: DOCTOR_APPROVAL_STATUS.APPROVED,
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email', 'phone', 'profilePhoto', 'isActive'],
        where: { isActive: true },
      },
      {
        model: Specialization,
        as: 'specialization',
        required: false,
      },
      {
        model: AvailabilitySlot,
        as: 'slots',
        required: false,
        where: {
          isBooked: false,
          isActive: true,
          startTime: { [Op.gte]: new Date() },
        },
      },
    ],
  });

  if (!doctor) {
    throw new AppError('Doctor not found or not approved', HTTP_STATUS.NOT_FOUND);
  }

  return doctor;
}

module.exports = {
  listApprovedDoctors,
  getDoctorPublicProfile,
};
