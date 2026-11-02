'use strict';

const { APPOINTMENT_STATUS } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define(
    'Appointment',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      patientUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'patient_user_id',
      },
      doctorProfileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'doctor_profile_id',
      },
      slotId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'slot_id',
      },
      status: {
        type: DataTypes.ENUM(
          APPOINTMENT_STATUS.BOOKED,
          APPOINTMENT_STATUS.CONFIRMED,
          APPOINTMENT_STATUS.COMPLETED,
          APPOINTMENT_STATUS.CANCELLED,
          APPOINTMENT_STATUS.NO_SHOW
        ),
        allowNull: false,
        defaultValue: APPOINTMENT_STATUS.BOOKED,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cancelledBy: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'cancelled_by',
      },
      cancelReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'cancel_reason',
      },
    },
    {
      tableName: 'appointments',
      underscored: true,
    }
  );

  Appointment.associate = (models) => {
    Appointment.belongsTo(models.User, {
      foreignKey: 'patientUserId',
      as: 'patient',
    });
    Appointment.belongsTo(models.DoctorProfile, {
      foreignKey: 'doctorProfileId',
      as: 'doctorProfile',
    });
    Appointment.belongsTo(models.AvailabilitySlot, {
      foreignKey: 'slotId',
      as: 'slot',
    });
    Appointment.hasMany(models.Prescription, {
      foreignKey: 'appointmentId',
      as: 'prescriptions',
    });
    Appointment.hasMany(models.MedicalReport, {
      foreignKey: 'appointmentId',
      as: 'reports',
    });
  };

  return Appointment;
};
