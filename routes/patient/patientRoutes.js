const express = require('express');
const router = express.Router();

const patientController = require('../../controllers/patient/patientController');
const appointmentController = require('../../controllers/appointment/appointmentController');
const clinicalController = require('../../controllers/clinical/clinicalController');
const { authenticate, authorize } = require('../../middlewares/auth');
const { uploadReport } = require('../../middlewares/upload');
const { ROLES } = require('../../constants');

router.use(authenticate, authorize(ROLES.PATIENT));

router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);

router.get('/doctors', patientController.listDoctors);
router.get('/doctors/:id', patientController.getDoctor);

router.get('/appointments', appointmentController.listMine);
router.post('/appointments', appointmentController.book);

router.get('/prescriptions', clinicalController.listPrescriptions);

router.get('/reports', clinicalController.listReports);
router.post('/reports', uploadReport, clinicalController.uploadReport);

router.get('/medical-history', clinicalController.medicalHistory);

module.exports = router;
