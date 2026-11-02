'use strict';

module.exports = (sequelize, DataTypes) => {
  const PatientProfile = sequelize.define(
    'PatientProfile',
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
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'date_of_birth',
      },
      gender: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      bloodGroup: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: 'blood_group',
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      emergencyContact: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'emergency_contact',
      },
      medicalHistorySummary: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'medical_history_summary',
      },
    },
    {
      tableName: 'patient_profiles',
      underscored: true,
    }
  );

  PatientProfile.associate = (models) => {
    PatientProfile.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return PatientProfile;
};
