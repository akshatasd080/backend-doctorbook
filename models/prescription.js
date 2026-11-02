'use strict';

module.exports = (sequelize, DataTypes) => {
  const Prescription = sequelize.define(
    'Prescription',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      doctorUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'doctor_user_id',
      },
      patientUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'patient_user_id',
      },
      appointmentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'appointment_id',
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      filePath: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'file_path',
      },
      prescribedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'prescribed_at',
      },
    },
    {
      tableName: 'prescriptions',
      underscored: true,
    }
  );

  Prescription.associate = (models) => {
    Prescription.belongsTo(models.User, {
      foreignKey: 'doctorUserId',
      as: 'doctor',
    });
    Prescription.belongsTo(models.User, {
      foreignKey: 'patientUserId',
      as: 'patient',
    });
    Prescription.belongsTo(models.Appointment, {
      foreignKey: 'appointmentId',
      as: 'appointment',
    });
    Prescription.hasMany(models.Message, {
      foreignKey: 'prescriptionId',
      as: 'messages',
    });
  };

  return Prescription;
};
