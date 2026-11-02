const express = require('express');
const router = express.Router();

const authController = require('../../controllers/auth/authController');
const { authenticate } = require('../../middlewares/auth');
const { validate } = require('../../middlewares/validate');
const {
  loginRules,
  registerPatientRules,
  registerDoctorRules,
} = require('../../validators/authValidators');

router.post(
  '/register/patient',
  registerPatientRules,
  validate,
  authController.registerPatient
);

router.post(
  '/register/doctor',
  registerDoctorRules,
  validate,
  authController.registerDoctor
);

router.post('/login', loginRules, validate, authController.login);

router.get('/me', authenticate, authController.me);

module.exports = router;
