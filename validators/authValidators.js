const { body } = require('express-validator');

const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const registerPatientRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .isLength({ min: 8, max: 20 })
    .withMessage('Phone must be 8–20 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('dateOfBirth').optional({ nullable: true }).isISO8601().withMessage('Invalid dateOfBirth'),
  body('gender').optional({ nullable: true }).isString(),
  body('bloodGroup').optional({ nullable: true }).isString(),
  body('address').optional({ nullable: true }).isString(),
  body('emergencyContact').optional({ nullable: true }).isString(),
];

const registerDoctorRules = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .isLength({ min: 8, max: 20 })
    .withMessage('Phone must be 8–20 characters'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('specializationId')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('specializationId must be a positive integer'),
  body('specialization').optional({ nullable: true }).isString(),
  body('qualifications').optional({ nullable: true }).isString(),
  body('medicalRegistrationNumber').optional({ nullable: true }).isString(),
  body('yearsOfExperience')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('yearsOfExperience must be >= 0'),
  body('hospitalClinicName').optional({ nullable: true }).isString(),
  body('hospitalClinicAddress').optional({ nullable: true }).isString(),
  body('consultationFee')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('consultationFee must be >= 0'),
  body('bio').optional({ nullable: true }).isString(),
];

module.exports = {
  loginRules,
  registerPatientRules,
  registerDoctorRules,
};
