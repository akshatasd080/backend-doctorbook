/**
 * Application-wide constants for DoctorBook Backend.
 */

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL_SERVER_ERROR: 500,
};

const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
};

const DOCTOR_APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const APPOINTMENT_STATUS = {
  BOOKED: 'booked',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  PRESCRIPTION: 'prescription',
  REPORT: 'report',
};

const UPLOAD_CATEGORIES = {
  PROFILE: 'profiles',
  DOCUMENT: 'documents',
  PRESCRIPTION: 'prescriptions',
  REPORT: 'reports',
  CHAT: 'chat',
};

const MESSAGES = {
  SERVER_RUNNING: 'DoctorBook API is running',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  INTERNAL_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  DOCTOR_PENDING: 'Doctor registration submitted. Awaiting admin approval.',
  DOCTOR_APPROVED: 'Doctor approved successfully',
  DOCTOR_REJECTED: 'Doctor application rejected',
  APPOINTMENT_BOOKED: 'Appointment booked successfully',
};

module.exports = {
  HTTP_STATUS,
  ROLES,
  DOCTOR_APPROVAL_STATUS,
  APPOINTMENT_STATUS,
  MESSAGE_TYPES,
  UPLOAD_CATEGORIES,
  MESSAGES,
};
