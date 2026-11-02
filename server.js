require('dotenv').config();

const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/database');
const { startJobs } = require('./jobs');
const { initSocket } = require('./sockets');

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  startJobs();

  const server = http.createServer(app);
  const io = initSocket(server);
  app.set('io', io);

  server.listen(PORT, () => {
    console.log('========================================');
    console.log(` DoctorBook API running on port ${PORT}`);
    console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(` Socket.IO   : path /socket.io`);
    console.log('========================================');
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
