'use strict';

module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    'Conversation',
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
      lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_message_at',
      },
    },
    {
      tableName: 'conversations',
      underscored: true,
    }
  );

  Conversation.associate = (models) => {
    Conversation.belongsTo(models.User, {
      foreignKey: 'doctorUserId',
      as: 'doctor',
    });
    Conversation.belongsTo(models.User, {
      foreignKey: 'patientUserId',
      as: 'patient',
    });
    Conversation.hasMany(models.Message, {
      foreignKey: 'conversationId',
      as: 'messages',
    });
  };

  return Conversation;
};
