const doctorService = require('../../services/doctorService');
const { asyncHandler, sendSuccess } = require('../../utils');
const { HTTP_STATUS } = require('../../constants');

const getProfile = asyncHandler(async (req, res) => {
  const data = await doctorService.getProfile(req.user.id);
  return sendSuccess(res, data);
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await doctorService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, data, 'Profile updated');
});

const uploadDocument = asyncHandler(async (req, res) => {
  const data = await doctorService.uploadDocument(
    req.user.id,
    req.file,
    req.body.documentType
  );
  return sendSuccess(res, data, 'Document uploaded', HTTP_STATUS.CREATED);
});

const listDocuments = asyncHandler(async (req, res) => {
  const data = await doctorService.listDocuments(req.user.id);
  return sendSuccess(res, data);
});

const deleteDocument = asyncHandler(async (req, res) => {
  const data = await doctorService.deleteDocument(req.user.id, req.params.id);
  return sendSuccess(res, data, 'Document deleted');
});

const submitForReview = asyncHandler(async (req, res) => {
  const data = await doctorService.submitForReview(req.user.id);
  return sendSuccess(res, data, 'Submitted for admin review');
});

const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const data = await doctorService.updateProfilePhoto(req.user.id, req.file);
  return sendSuccess(res, data, 'Profile photo updated');
});

module.exports = {
  getProfile,
  updateProfile,
  uploadDocument,
  listDocuments,
  deleteDocument,
  submitForReview,
  uploadProfilePhoto,
};
