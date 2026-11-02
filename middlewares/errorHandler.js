const { HTTP_STATUS, MESSAGES } = require('../constants');

function notFoundHandler(req, res, next) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message,
    });
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'Duplicate value — record already exists',
      errors: (err.errors || []).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Sequelize validation
  if (err.name === 'SequelizeValidationError') {
    return res.status(HTTP_STATUS.UNPROCESSABLE).json({
      success: false,
      message: MESSAGES.VALIDATION_ERROR,
      errors: (err.errors || []).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    success: false,
    message: err.message || MESSAGES.INTERNAL_ERROR,
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' &&
      !err.isOperational && { stack: err.stack }),
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
