const { sequelize } = require('../config/database');
const { HTTP_STATUS, MESSAGES } = require('../constants');

/**
 * Basic health check — confirms the API process is running.
 */
function getHealth(req, res) {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: MESSAGES.SERVER_RUNNING,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Database health check — confirms PostgreSQL is reachable.
 */
async function getDbHealth(req, res, next) {
  try {
    await sequelize.authenticate();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Database connection is healthy',
      database: process.env.DB_NAME,
      schema: process.env.DB_SCHEMA,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHealth,
  getDbHealth,
};
