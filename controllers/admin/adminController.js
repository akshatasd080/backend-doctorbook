const adminService = require('../../services/adminService');
const appointmentService = require('../../services/appointmentService');
const { asyncHandler, sendSuccess } = require('../../utils');
const { MESSAGES } = require('../../constants');

const listDoctors = asyncHandler(async (req, res) => {
  const data = await adminService.listDoctors({
    status: req.query.status,
    q: req.query.q,
  });
  return sendSuccess(res, data);
});

const listPendingDoctors = asyncHandler(async (req, res) => {
  const data = await adminService.listPendingDoctors();
  return sendSuccess(res, data);
});

const getDoctor = asyncHandler(async (req, res) => {
  const data = await adminService.getDoctorById(req.params.id);
  return sendSuccess(res, data);
});

const approveDoctor = asyncHandler(async (req, res) => {
  const data = await adminService.approveDoctor(req.params.id, req.user.id);
  return sendSuccess(res, data, MESSAGES.DOCTOR_APPROVED);
});

const rejectDoctor = asyncHandler(async (req, res) => {
  const data = await adminService.rejectDoctor(
    req.params.id,
    req.user.id,
    req.body.reason
  );
  return sendSuccess(res, data, MESSAGES.DOCTOR_REJECTED);
});

const listPatients = asyncHandler(async (req, res) => {
  const data = await adminService.listPatients({ q: req.query.q });
  return sendSuccess(res, data);
});

const listAppointments = asyncHandler(async (req, res) => {
  const data = await appointmentService.listAllForAdmin(req.query);
  return sendSuccess(res, data);
});

const getStats = asyncHandler(async (req, res) => {
  const data = await adminService.getStats();
  return sendSuccess(res, data);
});

const deactivateUser = asyncHandler(async (req, res) => {
  const data = await adminService.setUserActive(req.params.id, false);
  return sendSuccess(res, data, 'User deactivated');
});

const activateUser = asyncHandler(async (req, res) => {
  const data = await adminService.setUserActive(req.params.id, true);
  return sendSuccess(res, data, 'User activated');
});

module.exports = {
  listDoctors,
  listPendingDoctors,
  getDoctor,
  approveDoctor,
  rejectDoctor,
  listPatients,
  listAppointments,
  getStats,
  deactivateUser,
  activateUser,
};
