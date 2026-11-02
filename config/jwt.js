require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'doctorbook_jwt_secret_change_me_in_production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  issuer: 'doctorbook-api',
};
