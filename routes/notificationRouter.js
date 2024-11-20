const route = require('express').Router();
const {protect} = require('../middlewares/authMiddleware')
const controller =  require('../controllers/notificationController')

route.get('/notifications-user', protect, controller.getNotificationByUser);

route.put('/read-notification/:id', controller.readNotification)

module.exports =route;