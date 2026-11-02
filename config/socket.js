/**
 * Socket.IO bootstrap helpers.
 * Full chat handlers live in /sockets.
 */

function getSocketCorsOrigin() {
  return process.env.CORS_ORIGIN || '*';
}

module.exports = {
  getSocketCorsOrigin,
  path: '/socket.io',
};
