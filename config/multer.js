/**
 * Multer storage configuration for secure local file uploads.
 * Category folders: profiles | documents | prescriptions | reports | chat
 */

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { UPLOAD_CATEGORIES } = require('../constants');

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024;

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

Object.values(UPLOAD_CATEGORIES).forEach((folder) => {
  ensureDir(path.join(UPLOAD_ROOT, folder));
});

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const category = req.uploadCategory || UPLOAD_CATEGORIES.DOCUMENT;
    const dest = path.join(UPLOAD_ROOT, category);
    ensureDir(dest);
    cb(null, dest);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${safeBase}-${unique}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Unsupported file type'), false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = {
  upload,
  UPLOAD_ROOT,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
};
