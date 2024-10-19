const express = require('express')
const router = express.Router();
const { validateSendMessage, validateJoinMessage, validateLeaveMessage, validateCreateConversation } = require('../middlewares/messageMiddleware')
const messageController = require('../controllers/messageController')
const { protect } = require('../middlewares/authMiddleware');

//http: localhost:3000/messages

//send message
router.post('/send-message', [protect,validateSendMessage], messageController.sendMessage)

//join conversation
router.put('/join-conversation', [protect,validateJoinMessage], messageController.joinConversation);

//leave conversation
router.put('/leave-conversation', [protect,validateLeaveMessage], messageController.leaveConversation);

//create conversation
router.post('/create-conversation', [protect, validateCreateConversation], messageController.createConversation);

//get conversations
router.get('/get-conversations', protect, messageController.getConversations);


//get messages
router.get('/get-messages/:conversationId', protect, messageController.getMessages)


//get all conversations 
router.get('/get-all-conversations',protect, messageController.getAllConversations)

router.get('/get-conversation/:conversationId', protect, messageController.getConversation);

module.exports = router