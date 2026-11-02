const express = require('express');
const router = express.Router();

const appointmentController = require('../../controllers/appointment/appointmentController');
const { authenticate, authorize } = require('../../middlewares/auth');
const { ROLES } = require('../../constants');

router.use(authenticate);

router.post('/', authorize(ROLES.PATIENT), appointmentController.book);

router.get(
  '/',
  authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.ADMIN),
  appointmentController.listMine
);

router.get(
  '/:id',
  authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.ADMIN),
  appointmentController.getOne
);

router.patch(
  '/:id/status',
  authorize(ROLES.PATIENT, ROLES.DOCTOR, ROLES.ADMIN),
  appointmentController.updateStatus
);

module.exports = router;
