require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');

const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// --------------------------------------------
// Middleware
// --------------------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static uploads (sensitive files should also go through auth-gated download APIs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------------------------------------
// Routes
// --------------------------------------------
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to DoctorBook API',
    version: '1.0.0',
    clients: ['admin-web', 'doctor-app', 'patient-app'],
    docs: {
      architecture: '/docs/ARCHITECTURE.md (repo)',
      health: 'GET /api/health',
      dbHealth: 'GET /api/health/db',
      auth: '/api/auth',
      admin: '/api/admin',
      doctor: '/api/doctor',
      patient: '/api/patient',
      appointments: '/api/appointments',
      chat: '/api/chat',
      documents: '/api/documents',
    },
  });
});

app.use('/api', routes);

// --------------------------------------------
// Error handling
// --------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
