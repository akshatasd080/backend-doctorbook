/**
 * Chat service — conversations & messages (Phase 5).
 */

const path = require('path');
const { Op } = require('sequelize');
const db = require('../models');
const AppError = require('../utils/AppError');
const {
  HTTP_STATUS,
  ROLES,
  MESSAGE_TYPES,
  UPLOAD_CATEGORIES,
} = require('../constants');

const {
  User,
  Conversation,
  Message,
  Prescription,
  MedicalReport,
} = db;

async function getUserOrFail(userId) {
  const user = await User.findByPk(userId);
  if (!user || !user.isActive) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  }
  return user;
}

function pairDoctorPatient(userA, userB) {
  if (userA.role === ROLES.DOCTOR && userB.role === ROLES.PATIENT) {
    return { doctorUserId: userA.id, patientUserId: userB.id };
  }
  if (userA.role === ROLES.PATIENT && userB.role === ROLES.DOCTOR) {
    return { doctorUserId: userB.id, patientUserId: userA.id };
  }
  throw new AppError(
    'Chat is only allowed between a doctor and a patient',
    HTTP_STATUS.BAD_REQUEST
  );
}

async function assertConversationMember(conversation, userId) {
  if (
    conversation.doctorUserId !== userId &&
    conversation.patientUserId !== userId
  ) {
    throw new AppError('Forbidden', HTTP_STATUS.FORBIDDEN);
  }
}

async function getOrCreateConversation(userId, otherUserId) {
  if (!otherUserId) {
    throw new AppError('otherUserId is required', HTTP_STATUS.BAD_REQUEST);
  }
  if (Number(otherUserId) === Number(userId)) {
    throw new AppError('Cannot chat with yourself', HTTP_STATUS.BAD_REQUEST);
  }

  const me = await getUserOrFail(userId);
  const other = await getUserOrFail(otherUserId);
  const { doctorUserId, patientUserId } = pairDoctorPatient(me, other);

  let conversation = await Conversation.findOne({
    where: { doctorUserId, patientUserId },
    include: conversationIncludes(),
  });

  if (!conversation) {
    conversation = await Conversation.create({ doctorUserId, patientUserId });
    conversation = await Conversation.findByPk(conversation.id, {
      include: conversationIncludes(),
    });
  }

  return conversation;
}

function conversationIncludes() {
  return [
    {
      model: User,
      as: 'doctor',
      attributes: ['id', 'fullName', 'email', 'profilePhoto', 'role'],
    },
    {
      model: User,
      as: 'patient',
      attributes: ['id', 'fullName', 'email', 'profilePhoto', 'role'],
    },
  ];
}

async function listConversations(userId) {
  const conversations = await Conversation.findAll({
    where: {
      [Op.or]: [{ doctorUserId: userId }, { patientUserId: userId }],
    },
    include: conversationIncludes(),
    order: [
      ['lastMessageAt', 'DESC'],
      ['updatedAt', 'DESC'],
    ],
  });
  return conversations;
}

async function getConversationForUser(conversationId, userId) {
  const conversation = await Conversation.findByPk(conversationId, {
    include: conversationIncludes(),
  });
  if (!conversation) {
    throw new AppError('Conversation not found', HTTP_STATUS.NOT_FOUND);
  }
  await assertConversationMember(conversation, userId);
  return conversation;
}

async function listMessages(conversationId, userId, pagination = {}) {
  await getConversationForUser(conversationId, userId);

  const limit = Math.min(Number(pagination.limit) || 50, 100);
  const page = Math.max(Number(pagination.page) || 1, 1);
  const offset = (page - 1) * limit;

  const { rows, count } = await Message.findAndCountAll({
    where: { conversationId },
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'fullName', 'role', 'profilePhoto'],
      },
      { model: Prescription, as: 'prescription', required: false },
      { model: MedicalReport, as: 'medicalReport', required: false },
    ],
    order: [['createdAt', 'ASC']],
    limit,
    offset,
  });

  return {
    items: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit) || 1,
    },
  };
}

async function createMessage(conversationId, senderId, payload = {}, file = null) {
  const conversation = await getConversationForUser(conversationId, senderId);

  let messageType = payload.type || payload.messageType || MESSAGE_TYPES.TEXT;
  let filePath = payload.filePath || null;
  let content = payload.content || null;

  if (file) {
    const category = UPLOAD_CATEGORIES.CHAT;
    filePath = path.posix.join('/uploads', category, file.filename);
    if (file.mimetype?.startsWith('image/')) {
      messageType = MESSAGE_TYPES.IMAGE;
    } else if (
      ![MESSAGE_TYPES.PRESCRIPTION, MESSAGE_TYPES.REPORT].includes(messageType)
    ) {
      messageType = MESSAGE_TYPES.FILE;
    }
  }

  if (messageType === MESSAGE_TYPES.TEXT && !content) {
    throw new AppError('Message content is required', HTTP_STATUS.BAD_REQUEST);
  }

  if (
    [MESSAGE_TYPES.IMAGE, MESSAGE_TYPES.FILE].includes(messageType) &&
    !filePath
  ) {
    throw new AppError('File is required for this message type', HTTP_STATUS.BAD_REQUEST);
  }

  const message = await Message.create({
    conversationId: conversation.id,
    senderId,
    messageType,
    content,
    filePath,
    prescriptionId: payload.prescriptionId || null,
    medicalReportId: payload.medicalReportId || null,
    isRead: false,
  });

  await conversation.update({ lastMessageAt: new Date() });

  return Message.findByPk(message.id, {
    include: [
      {
        model: User,
        as: 'sender',
        attributes: ['id', 'fullName', 'role', 'profilePhoto'],
      },
      { model: Prescription, as: 'prescription', required: false },
      { model: MedicalReport, as: 'medicalReport', required: false },
    ],
  });
}

async function markRead(conversationId, userId) {
  const conversation = await getConversationForUser(conversationId, userId);

  await Message.update(
    { isRead: true },
    {
      where: {
        conversationId: conversation.id,
        senderId: { [Op.ne]: userId },
        isRead: false,
      },
    }
  );

  return { conversationId: conversation.id, markedRead: true };
}

module.exports = {
  getOrCreateConversation,
  listConversations,
  listMessages,
  createMessage,
  markRead,
  getConversationForUser,
};
