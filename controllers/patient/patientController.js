const patientService = require('../../services/patientService');
const patientProfileService = require('../../services/patientProfileService');
const { asyncHandler, sendSuccess } = require('../../utils');

const getProfile = asyncHandler(async (req, res) => {
  const data = await patientProfileService.getProfile(req.user.id);
  return sendSuccess(res, data);
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = await patientProfileService.updateProfile(req.user.id, req.body);
  return sendSuccess(res, data, 'Profile updated');
});

const listDoctors = asyncHandler(async (req, res) => {
  const data = await patientService.listApprovedDoctors(req.query);
  return sendSuccess(res, data);
});

const getDoctor = asyncHandler(async (req, res) => {
  const data = await patientService.getDoctorPublicProfile(req.params.id);
  return sendSuccess(res, data);
});

module.exports = {
  getProfile,
  updateProfile,
  listDoctors,
  getDoctor,
};
