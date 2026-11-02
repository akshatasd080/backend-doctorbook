/**
 * Real-time chat events (Phase 5).
 */

const chatService = require('../services/chatService');

function registerChatHandlers(io, socket) {
  socket.on('join_conversation', async ({ conversationId }) => {
    try {
      if (!conversationId) return;
      await chatService.getConversationForUser(conversationId, socket.user.id);
      socket.join(`conversation:${conversationId}`);
      socket.emit('joined_conversation', { conversationId });
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('typing', ({ conversationId }) => {
    if (!conversationId) return;
    socket.to(`conversation:${conversationId}`).emit('user_typing', {
      userId: socket.user.id,
      conversationId,
    });
  });

  socket.on('stop_typing', ({ conversationId }) => {
    if (!conversationId) return;
    socket.to(`conversation:${conversationId}`).emit('user_stop_typing', {
      userId: socket.user.id,
      conversationId,
    });
  });

  socket.on('send_message', async (payload = {}) => {
    try {
      const { conversationId, content, type, filePath, prescriptionId, medicalReportId } =
        payload;

      const message = await chatService.createMessage(
        conversationId,
        socket.user.id,
        {
          content,
          type,
          filePath,
          prescriptionId,
          medicalReportId,
        }
      );

      io.to(`conversation:${conversationId}`).emit('new_message', message);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('mark_read', async ({ conversationId }) => {
    try {
      const result = await chatService.markRead(conversationId, socket.user.id);
      socket.to(`conversation:${conversationId}`).emit('messages_read', {
        conversationId,
        userId: socket.user.id,
      });
      socket.emit('marked_read', result);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });
}

module.exports = { registerChatHandlers };
