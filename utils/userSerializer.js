/**
 * Strip sensitive fields and shape user payloads for API responses.
 */

function serializeUser(user, extras = {}) {
  if (!user) return null;

  const plain = typeof user.toJSON === 'function' ? user.toJSON() : user;

  return {
    id: plain.id,
    fullName: plain.fullName,
    email: plain.email,
    phone: plain.phone,
    role: plain.role,
    profilePhoto: plain.profilePhoto,
    isActive: plain.isActive,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    ...extras,
  };
}

module.exports = {
  serializeUser,
};
