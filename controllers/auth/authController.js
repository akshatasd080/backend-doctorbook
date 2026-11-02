const authService = require('../../services/authService');
const { asyncHandler, sendSuccess } = require('../../utils');
const { HTTP_STATUS, MESSAGES } = require('../../constants');

const registerPatient = asyncHandler(async (req, res) => {
  const data = await authService.registerPatient(req.body);
  return sendSuccess(res, data, MESSAGES.REGISTER_SUCCESS, HTTP_STATUS.CREATED);
});

const registerDoctor = asyncHandler(async (req, res) => {
  const data = await authService.registerDoctor(req.body);
  return sendSuccess(res, data, MESSAGES.DOCTOR_PENDING, HTTP_STATUS.CREATED);
});

const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  return sendSuccess(res, data, MESSAGES.LOGIN_SUCCESS);
});

const me = asyncHandler(async (req, res) => {
  const data = await authService.getMe(req.user.id);
  return sendSuccess(res, data);
});

module.exports = {
  registerPatient,
  registerDoctor,
  login,
  me,
};
