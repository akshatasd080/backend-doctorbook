const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const authRoutes = require('./auth/authRoutes');
const adminRoutes = require('./admin/adminRoutes');
const doctorRoutes = require('./doctor/doctorRoutes');
const patientRoutes = require('./patient/patientRoutes');
const appointmentRoutes = require('./appointment/appointmentRoutes');
const chatRoutes = require('./chat/chatRoutes');
const documentRoutes = require('./document/documentRoutes');
const specializationRoutes = require('./specializationRoutes');

/**
 * Mount all API modules.
 */
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/doctor', doctorRoutes);
router.use('/patient', patientRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/chat', chatRoutes);
router.use('/documents', documentRoutes);
router.use('/specializations', specializationRoutes);

module.exports = router;
