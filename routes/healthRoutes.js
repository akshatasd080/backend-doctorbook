const express = require('express');
const router = express.Router();
const { getHealth, getDbHealth } = require('../controllers/healthController');

// GET /api/health
router.get('/', getHealth);

// GET /api/health/db
router.get('/db', getDbHealth);

module.exports = router;
