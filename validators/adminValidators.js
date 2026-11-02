const { body, param } = require('express-validator');

const doctorIdParam = [
  param('id').isInt({ min: 1 }).withMessage('Invalid doctor id'),
];

const rejectRules = [
  ...doctorIdParam,
  body('reason').trim().notEmpty().withMessage('Rejection reason is required'),
];

module.exports = {
  doctorIdParam,
  rejectRules,
};
