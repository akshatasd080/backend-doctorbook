const path = require('path');
const { asyncHandler, sendSuccess } = require('../../utils');
const { HTTP_STATUS, UPLOAD_CATEGORIES } = require('../../constants');
const AppError = require('../../utils/AppError');

/**
 * Generic authenticated upload (category from query/body).
 * Doctor verification docs should prefer POST /api/doctor/documents.
 */
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('File is required', HTTP_STATUS.BAD_REQUEST);
  }

  const category = req.uploadCategory || UPLOAD_CATEGORIES.DOCUMENT;
  const filePath = path.posix.join('/uploads', category, req.file.filename);

  return sendSuccess(
    res,
    {
      filePath,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      category,
    },
    'File uploaded',
    HTTP_STATUS.CREATED
  );
});

module.exports = {
  uploadFile,
};
