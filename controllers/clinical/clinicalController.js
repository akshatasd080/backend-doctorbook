const clinicalService = require('../../services/clinicalService');
const { asyncHandler, sendSuccess } = require('../../utils');
const { HTTP_STATUS } = require('../../constants');

const uploadPrescription = asyncHandler(async (req, res) => {
  const data = await clinicalService.uploadPrescription(
    req.user.id,
    req.file,
    req.body,
    req.app.get('io')
  );
  return sendSuccess(res, data, 'Prescription uploaded', HTTP_STATUS.CREATED);
});

const listPrescriptions = asyncHandler(async (req, res) => {
  const data = await clinicalService.listPrescriptionsForUser(
    req.user.id,
    req.user.role
  );
  return sendSuccess(res, data);
});

const uploadReport = asyncHandler(async (req, res) => {
  const data = await clinicalService.uploadMedicalReport(
    req.user.id,
    req.user.role,
    req.file,
    req.body,
    req.app.get('io')
  );
  return sendSuccess(res, data, 'Report uploaded', HTTP_STATUS.CREATED);
});

const listReports = asyncHandler(async (req, res) => {
  const data = await clinicalService.listMedicalReports(
    req.user.id,
    req.user.role,
    req.query
  );
  return sendSuccess(res, data);
});

const medicalHistory = asyncHandler(async (req, res) => {
  const patientUserId =
    req.user.role === 'patient' ? req.user.id : req.params.patientUserId || req.query.patientUserId;

  const data = await clinicalService.getMedicalHistory(
    patientUserId,
    req.user.id,
    req.user.role
  );
  return sendSuccess(res, data);
});

module.exports = {
  uploadPrescription,
  listPrescriptions,
  uploadReport,
  listReports,
  medicalHistory,
};
