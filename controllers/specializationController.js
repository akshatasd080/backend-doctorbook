const db = require('../models');
const { asyncHandler, sendSuccess } = require('../utils');

const list = asyncHandler(async (req, res) => {
  const data = await db.Specialization.findAll({
    order: [['name', 'ASC']],
  });
  return sendSuccess(res, data);
});

module.exports = { list };
