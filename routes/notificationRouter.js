const express= require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController')
const {validateCreateNotification} = require('../middlewares/notificationMiddleware')

// http:localhost:3000/notifications

//create notification
router.post('/create-notification', validateCreateNotification, notificationController.createNotification)

//read notification
router.put('/read-notification/:id', notificationController.readNotification)


module.exports = router;