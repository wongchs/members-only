const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const messageController = require('../controllers/messageController');

router.get('/create', userController.isAdmin, messageController.createMessageGet);
router.post('/create', userController.isAdmin, messageController.createMessagePost);
router.get('/message/:id/delete', userController.isAdmin, messageController.getDeleteMessage);
router.post('/message/:id/delete', userController.isAdmin, messageController.postDeleteMessage);

module.exports = router;
