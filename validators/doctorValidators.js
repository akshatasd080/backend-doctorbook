const { body, param } = require('express-validator');

const updateProfileRules = [
  body('fullName').optional().trim().notEmpty().withMessage('fullName cannot be empty'),
  body('phone').optional().trim().isLength({ min: 8, max: 20 }),
  body('specializationId').optional({ nullable: true }).isInt({ min: 1 }),
  body('specialization').optional({ nullable: true }).isString(),
  body('qualifications').optional({ nullable: true }).isString(),
  body('medicalRegistrationNumber').optional({ nullable: true }).isString(),
  body('yearsOfExperience').optional({ nullable: true }).isInt({ min: 0 }),
  body('hospitalClinicName').optional({ nullable: true }).isString(),
  body('hospitalClinicAddress').optional({ nullable: true }).isString(),
  body('consultationFee').optional({ nullable: true }).isFloat({ min: 0 }),
  body('bio').optional({ nullable: true }).isString(),
];

const documentIdParam = [
  param('id').isInt({ min: 1 }).withMessage('Invalid document id'),
];

module.exports = {
  updateProfileRules,
  documentIdParam,
};
