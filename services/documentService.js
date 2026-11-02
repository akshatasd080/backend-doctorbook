/**
 * Document service — prescriptions, reports, verification files (Phase 3/6).
 */

const AppError = require('../utils/AppError');
const { HTTP_STATUS } = require('../constants');

async function saveUpload(_meta) {
  throw new AppError('Document module not implemented yet', HTTP_STATUS.INTERNAL_SERVER_ERROR);
}

module.exports = {
  saveUpload,
};
