const route = require('express').Router();
const {protect} = require('../middlewares/authMiddleware')
const controller =  require('../controllers/notificationController')

route.get('/notifications-user', protect, controller.getNotificationByUser);

module.exports =route;