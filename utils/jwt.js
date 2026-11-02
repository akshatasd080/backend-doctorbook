const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

function signToken(payload) {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    issuer: jwtConfig.issuer,
  });
}

function verifyToken(token) {
  return jwt.verify(token, jwtConfig.secret, {
    issuer: jwtConfig.issuer,
  });
}

module.exports = {
  signToken,
  verifyToken,
};
