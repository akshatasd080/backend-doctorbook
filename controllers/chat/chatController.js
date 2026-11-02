const chatService = require('../../services/chatService');
const { asyncHandler, sendSuccess } = require('../../utils');
const { HTTP_STATUS } = require('../../constants');

const listConversations = asyncHandler(async (req, res) => {
  const data = await chatService.listConversations(req.user.id);
  return sendSuccess(res, data);
});

const startConversation = asyncHandler(async (req, res) => {
  const data = await chatService.getOrCreateConversation(
    req.user.id,
    req.body.otherUserId
  );
  return sendSuccess(res, data, 'Conversation ready', HTTP_STATUS.CREATED);
});

const listMessages = asyncHandler(async (req, res) => {
  const data = await chatService.listMessages(
    req.params.id,
    req.user.id,
    req.query
  );
  return sendSuccess(res, data);
});

const sendMessage = asyncHandler(async (req, res) => {
  const data = await chatService.createMessage(
    req.params.id,
    req.user.id,
    req.body,
    req.file || null
  );

  const io = req.app.get('io');
  if (io) {
    io.to(`conversation:${req.params.id}`).emit('new_message', data);
  }

  return sendSuccess(res, data, 'Message sent', HTTP_STATUS.CREATED);
});

const markRead = asyncHandler(async (req, res) => {
  const data = await chatService.markRead(req.params.id, req.user.id);
  return sendSuccess(res, data, 'Messages marked as read');
});

module.exports = {
  listConversations,
  startConversation,
  listMessages,
  sendMessage,
  markRead,
};
