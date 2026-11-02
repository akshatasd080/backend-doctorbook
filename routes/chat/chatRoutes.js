const express = require('express');
const router = express.Router();

const chatController = require('../../controllers/chat/chatController');
const { authenticate, authorize } = require('../../middlewares/auth');
const { uploadChatMedia } = require('../../middlewares/upload');
const { optionalMultipart } = require('../../middlewares/optionalUpload');
const { ROLES } = require('../../constants');

router.use(authenticate, authorize(ROLES.DOCTOR, ROLES.PATIENT));

router.get('/conversations', chatController.listConversations);
router.post('/conversations', chatController.startConversation);
router.get('/conversations/:id/messages', chatController.listMessages);
router.post(
  '/conversations/:id/messages',
  optionalMultipart(uploadChatMedia),
  chatController.sendMessage
);
router.patch('/conversations/:id/read', chatController.markRead);

module.exports = router;
