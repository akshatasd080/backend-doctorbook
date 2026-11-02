'use strict';

module.exports = (sequelize, DataTypes) => {
  const AvailabilitySlot = sequelize.define(
    'AvailabilitySlot',
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
      startTime: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'start_time',
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'end_time',
      },
      isBooked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_booked',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },
    },
    {
      tableName: 'availability_slots',
      underscored: true,
    }
  );

  AvailabilitySlot.associate = (models) => {
    AvailabilitySlot.belongsTo(models.DoctorProfile, {
      foreignKey: 'doctorProfileId',
      as: 'doctorProfile',
    });
    AvailabilitySlot.hasOne(models.Appointment, {
      foreignKey: 'slotId',
      as: 'appointment',
    });
  };

  return AvailabilitySlot;
};
