const express = require('express');
const router = express.Router();

const adminController = require('../../controllers/admin/adminController');
const { authenticate, authorize } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const { doctorIdParam, rejectRules } = require('../../validators/adminValidators');
const { ROLES } = require('../../constants');

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/stats', adminController.getStats);

router.get('/doctors', adminController.listDoctors);
router.get('/doctors/pending', adminController.listPendingDoctors);
router.get('/doctors/:id', doctorIdParam, validate, adminController.getDoctor);
router.patch(
  '/doctors/:id/approve',
  doctorIdParam,
  validate,
  adminController.approveDoctor
);
router.patch(
  '/doctors/:id/reject',
  rejectRules,
  validate,
  adminController.rejectDoctor
);

router.get('/patients', adminController.listPatients);
router.get('/appointments', adminController.listAppointments);

router.patch('/users/:id/deactivate', adminController.deactivateUser);
router.patch('/users/:id/activate', adminController.activateUser);

module.exports = router;
