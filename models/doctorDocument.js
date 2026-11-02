'use strict';

module.exports = (sequelize, DataTypes) => {
  const DoctorDocument = sequelize.define(
    'DoctorDocument',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      doctorProfileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'doctor_profile_id',
      },
      documentType: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'document_type',
      },
      filePath: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'file_path',
      },
      originalName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'original_name',
      },
      mimeType: {
        type: DataTypes.STRING(120),
        allowNull: true,
        field: 'mime_type',
      },
    },
    {
      tableName: 'doctor_documents',
      underscored: true,
    }
  );

  DoctorDocument.associate = (models) => {
    DoctorDocument.belongsTo(models.DoctorProfile, {
      foreignKey: 'doctorProfileId',
      as: 'doctorProfile',
    });
  };

  return DoctorDocument;
};
