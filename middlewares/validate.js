/**
 * Run express-validator result checks.
 */

const { validationResult } = require('express-validator');
const { HTTP_STATUS, MESSAGES } = require('../constants');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.UNPROCESSABLE).json({
      success: false,
      message: MESSAGES.VALIDATION_ERROR,
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
}

module.exports = { validate };
