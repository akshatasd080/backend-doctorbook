'use strict';

module.exports = (sequelize, DataTypes) => {
  const Specialization = sequelize.define(
    'Specialization',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'specializations',
      underscored: true,
    }
  );

  Specialization.associate = (models) => {
    Specialization.hasMany(models.DoctorProfile, {
      foreignKey: 'specializationId',
      as: 'doctors',
    });
  };

  return Specialization;
};
