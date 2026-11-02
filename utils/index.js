/**
 * Shared utility helpers for DoctorBook Backend.
 */

const AppError = require('./AppError');
const { signToken, verifyToken } = require('./jwt');
const { hashPassword, comparePassword } = require('./password');
const { serializeUser } = require('./userSerializer');

function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function sendError(res, message = 'Error', statusCode = 500, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  signToken,
  verifyToken,
  hashPassword,
  comparePassword,
  serializeUser,
  sendSuccess,
  sendError,
  asyncHandler,
};
