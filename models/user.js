'use strict';

const { ROLES } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fullName: {
        type: DataTypes.STRING(150),
        allowNull: false,
        field: 'full_name',
      },
      email: {
        type: DataTypes.STRING(180),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash',
      },
      role: {
        type: DataTypes.ENUM(ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT),
        allowNull: false,
      },
      profilePhoto: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'profile_photo',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },
    },
    {
      tableName: 'users',
      underscored: true,
    }
  );

  User.associate = (models) => {
    User.hasOne(models.DoctorProfile, {
      foreignKey: 'userId',
      as: 'doctorProfile',
    });
    User.hasOne(models.PatientProfile, {
      foreignKey: 'userId',
      as: 'patientProfile',
    });
    User.hasMany(models.Appointment, {
      foreignKey: 'patientUserId',
      as: 'patientAppointments',
    });
    User.hasMany(models.Conversation, {
      foreignKey: 'doctorUserId',
      as: 'doctorConversations',
    });
    User.hasMany(models.Conversation, {
      foreignKey: 'patientUserId',
      as: 'patientConversations',
    });
    User.hasMany(models.Message, {
      foreignKey: 'senderId',
      as: 'sentMessages',
    });
    User.hasMany(models.Prescription, {
      foreignKey: 'doctorUserId',
      as: 'writtenPrescriptions',
    });
    User.hasMany(models.Prescription, {
      foreignKey: 'patientUserId',
      as: 'receivedPrescriptions',
    });
    User.hasMany(models.MedicalReport, {
      foreignKey: 'uploadedBy',
      as: 'uploadedReports',
    });
    User.hasMany(models.MedicalReport, {
      foreignKey: 'patientUserId',
      as: 'medicalReports',
    });
  };

  return User;
};
