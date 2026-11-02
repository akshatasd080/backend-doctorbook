'use strict';

const { DOCTOR_APPROVAL_STATUS } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  const DoctorProfile = sequelize.define(
    'DoctorProfile',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'user_id',
      },
      specializationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'specialization_id',
      },
      qualifications: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      medicalRegistrationNumber: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'medical_registration_number',
      },
      yearsOfExperience: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'years_of_experience',
      },
      hospitalClinicName: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'hospital_clinic_name',
      },
      hospitalClinicAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'hospital_clinic_address',
      },
      consultationFee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'consultation_fee',
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      approvalStatus: {
        type: DataTypes.ENUM(
          DOCTOR_APPROVAL_STATUS.PENDING,
          DOCTOR_APPROVAL_STATUS.APPROVED,
          DOCTOR_APPROVAL_STATUS.REJECTED
        ),
        allowNull: false,
        defaultValue: DOCTOR_APPROVAL_STATUS.PENDING,
        field: 'approval_status',
      },
      rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'rejection_reason',
      },
      submittedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'submitted_at',
      },
      reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reviewed_at',
      },
      reviewedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'reviewed_by',
      },
    },
    {
      tableName: 'doctor_profiles',
      underscored: true,
    }
  );

  DoctorProfile.associate = (models) => {
    DoctorProfile.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    DoctorProfile.belongsTo(models.Specialization, {
      foreignKey: 'specializationId',
      as: 'specialization',
    });
    DoctorProfile.belongsTo(models.User, {
      foreignKey: 'reviewedBy',
      as: 'reviewer',
    });
    DoctorProfile.hasMany(models.DoctorDocument, {
      foreignKey: 'doctorProfileId',
      as: 'documents',
    });
    DoctorProfile.hasMany(models.AvailabilitySlot, {
      foreignKey: 'doctorProfileId',
      as: 'slots',
    });
    DoctorProfile.hasMany(models.Appointment, {
      foreignKey: 'doctorProfileId',
      as: 'appointments',
    });
  };

  return DoctorProfile;
};
