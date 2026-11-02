'use strict';

const { MESSAGE_TYPES } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    'Message',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'conversation_id',
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'sender_id',
      },
      messageType: {
        type: DataTypes.ENUM(
          MESSAGE_TYPES.TEXT,
          MESSAGE_TYPES.IMAGE,
          MESSAGE_TYPES.FILE,
          MESSAGE_TYPES.PRESCRIPTION,
          MESSAGE_TYPES.REPORT
        ),
        allowNull: false,
        defaultValue: MESSAGE_TYPES.TEXT,
        field: 'message_type',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      filePath: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'file_path',
      },
      prescriptionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'prescription_id',
      },
      medicalReportId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'medical_report_id',
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_read',
      },
    },
    {
      tableName: 'messages',
      underscored: true,
    }
  );

  Message.associate = (models) => {
    Message.belongsTo(models.Conversation, {
      foreignKey: 'conversationId',
      as: 'conversation',
    });
    Message.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender',
    });
    Message.belongsTo(models.Prescription, {
      foreignKey: 'prescriptionId',
      as: 'prescription',
    });
    Message.belongsTo(models.MedicalReport, {
      foreignKey: 'medicalReportId',
      as: 'medicalReport',
    });
  };

  return Message;
};
