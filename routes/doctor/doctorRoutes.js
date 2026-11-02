const express = require('express');
const router = express.Router();

const doctorController = require('../../controllers/doctor/doctorController');
const appointmentController = require('../../controllers/appointment/appointmentController');
const clinicalController = require('../../controllers/clinical/clinicalController');
const { authenticate, authorize } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const {
  uploadDocument,
  uploadProfile,
  uploadPrescription,
  uploadReport,
} = require('../../middlewares/upload');
const {
  updateProfileRules,
  documentIdParam,
} = require('../../validators/doctorValidators');
const { ROLES } = require('../../constants');

router.use(authenticate, authorize(ROLES.DOCTOR));

router.get('/profile', doctorController.getProfile);
router.put('/profile', updateProfileRules, validate, doctorController.updateProfile);
router.post('/profile/photo', uploadProfile, doctorController.uploadProfilePhoto);

router.get('/documents', doctorController.listDocuments);
router.post('/documents', uploadDocument, doctorController.uploadDocument);
router.delete(
  '/documents/:id',
  documentIdParam,
  validate,
  doctorController.deleteDocument
);

router.post('/submit-for-review', doctorController.submitForReview);

router.get('/slots', appointmentController.listDoctorSlots);
router.post('/slots', appointmentController.createSlots);
router.delete('/slots/:id', appointmentController.deleteSlot);

router.get('/appointments', appointmentController.listMine);

router.post(
  '/prescriptions',
  uploadPrescription,
  clinicalController.uploadPrescription
);
router.get('/prescriptions', clinicalController.listPrescriptions);

router.post('/reports', uploadReport, clinicalController.uploadReport);
router.get('/reports', clinicalController.listReports);

router.get(
  '/patients/:patientUserId/history',
  clinicalController.medicalHistory
);

module.exports = router;
