'use strict';

module.exports = (sequelize, DataTypes) => {
  const MedicalReport = sequelize.define(
    'MedicalReport',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'uploaded_by',
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
      reportType: {
        type: DataTypes.STRING(80),
        allowNull: true,
        field: 'report_type',
      },
      filePath: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'file_path',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'medical_reports',
      underscored: true,
    }
  );

  MedicalReport.associate = (models) => {
    MedicalReport.belongsTo(models.User, {
      foreignKey: 'uploadedBy',
      as: 'uploader',
    });
    MedicalReport.belongsTo(models.User, {
      foreignKey: 'patientUserId',
      as: 'patient',
    });
    MedicalReport.belongsTo(models.Appointment, {
      foreignKey: 'appointmentId',
      as: 'appointment',
    });
    MedicalReport.hasMany(models.Message, {
      foreignKey: 'medicalReportId',
      as: 'messages',
    });
  };

  return MedicalReport;
};
