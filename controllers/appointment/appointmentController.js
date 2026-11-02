const appointmentService = require('../../services/appointmentService');
const { asyncHandler, sendSuccess } = require('../../utils');
const { HTTP_STATUS, MESSAGES } = require('../../constants');

const createSlots = asyncHandler(async (req, res) => {
  const data = await appointmentService.createSlots(req.user.id, req.body);
  return sendSuccess(res, data, 'Slots created', HTTP_STATUS.CREATED);
});

const listDoctorSlots = asyncHandler(async (req, res) => {
  const data = await appointmentService.listSlotsForDoctor(req.user.id, req.query);
  return sendSuccess(res, data);
});

const deleteSlot = asyncHandler(async (req, res) => {
  const data = await appointmentService.deleteSlot(req.user.id, req.params.id);
  return sendSuccess(res, data, 'Slot removed');
});

const book = asyncHandler(async (req, res) => {
  const data = await appointmentService.bookAppointment(req.user.id, req.body);
  return sendSuccess(res, data, MESSAGES.APPOINTMENT_BOOKED, HTTP_STATUS.CREATED);
});

const listMine = asyncHandler(async (req, res) => {
  const data = await appointmentService.listForUser(
    req.user.id,
    req.user.role,
    req.query
  );
  return sendSuccess(res, data);
});

const getOne = asyncHandler(async (req, res) => {
  const data = await appointmentService.getById(
    req.params.id,
    req.user.id,
    req.user.role
  );
  return sendSuccess(res, data);
});

const updateStatus = asyncHandler(async (req, res) => {
  const data = await appointmentService.updateStatus(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body
  );
  return sendSuccess(res, data, 'Appointment updated');
});

module.exports = {
  createSlots,
  listDoctorSlots,
  deleteSlot,
  book,
  listMine,
  getOne,
  updateStatus,
};
