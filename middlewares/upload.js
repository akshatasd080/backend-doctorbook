/**
 * Upload middleware helpers — set category then run multer.
 */

const { upload } = require('../config/multer');
const { UPLOAD_CATEGORIES } = require('../constants');

function setUploadCategory(category) {
  return (req, res, next) => {
    req.uploadCategory = category;
    next();
  };
}

const uploadProfile = [
  setUploadCategory(UPLOAD_CATEGORIES.PROFILE),
  upload.single('file'),
];

const uploadDocument = [
  setUploadCategory(UPLOAD_CATEGORIES.DOCUMENT),
  upload.single('file'),
];

const uploadPrescription = [
  setUploadCategory(UPLOAD_CATEGORIES.PRESCRIPTION),
  upload.single('file'),
];

const uploadReport = [
  setUploadCategory(UPLOAD_CATEGORIES.REPORT),
  upload.single('file'),
];

const uploadChatMedia = [
  setUploadCategory(UPLOAD_CATEGORIES.CHAT),
  upload.single('file'),
];

module.exports = {
  setUploadCategory,
  uploadProfile,
  uploadDocument,
  uploadPrescription,
  uploadReport,
  uploadChatMedia,
};
