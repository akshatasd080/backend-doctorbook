/**
 * Attach Socket.IO to the HTTP server and register domain handlers.
 */

const { Server } = require('socket.io');
const { getSocketCorsOrigin } = require('../config/socket');
const { registerChatHandlers } = require('./chatHandler');
const { verifyToken } = require('../utils/jwt');

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: getSocketCorsOrigin(),
      credentials: true,
    },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Unauthorized'));
      }

      socket.user = verifyToken(token);
      next();
    } catch (err) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: user=${socket.user?.id} id=${socket.id}`);
    registerChatHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = { initSocket };
