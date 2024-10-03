const express = require('express')
const router = express.Router();
const { validateSendMessage } = require('../middlewares/messageMiddleware')
const messageController = require('../controllers/messageController')

//http: localhost:3000/messages

//send message
router.post('/send-message', validateSendMessage, messageController.sendMessage)




module.exports = router