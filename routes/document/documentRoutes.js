const express = require('express');
const router = express.Router();

const documentController = require('../../controllers/document/documentController');
const { authenticate } = require('../../middlewares/auth');
const { uploadDocument } = require('../../middlewares/upload');

router.use(authenticate);

router.post('/upload', uploadDocument, documentController.uploadFile);

module.exports = router;
