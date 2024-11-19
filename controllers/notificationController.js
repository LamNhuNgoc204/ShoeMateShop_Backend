const Order = require('../models/orderModel')
const User = require('../models/userModel')
const Notification = require('../models/notificationModel');
const { create } = require('hbs');
const OrderDetail = require('../models/orderDetailModel')
const {getIo} = require('../socket');
const { sendNotification } = require('../firebase');

exports.createNotification = async (orderId, content) => {
    try {
        if(!orderId) {
            throw new Error('You must specify a order')
        }
        if(!content) {
            throw new Error('You must specify a content')
        }
        const order = await Order.findById(orderId);
        const notification = await Notification.create({
            order_id: order._id,
            user_id: order.user_id,
            content,
            isRead: false
        })

        const orderDetails = await OrderDetail.find({order_id: order._id})
        const user = await User.findById(order.user_id);

        getIo().emit('createdNotification', {
            notification: {
                ...notification,
                order: {
                    order,
                    orderDetails
                }
            }
        })

        await sendNotification(user.FCMToken,`Đơn hàng #${order._id}` , content)
        
        return true;
    } catch (error) {
        console.error("Error: ", error);
    }
}


exports.readNotification = async (req, res) => {
    try {
        const { id } = req.params
        const notification = await Notification.findById(id);
        if (!notification) {
            return res.status(404).json({ status: false, message: "Notification not found" });
        }
        notification.isRead = true;
        const rNotification = await notification.save();
        return res.status(200).json({ status: true, message: "Notification read successfully", data: rNotification });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}


exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findById(id);
        if (!id) {
            return res.status(400).json({ status: false, message: "Notification ID is required!" });
        }
        if (!notification) {
            return res.status(404).json({ status: false, message: "Notification not found!" });
        }
        await Notification.findByIdAndDelete(id)
        return res.status(200).json({ status: true, message: "Notification deleted successfully!" });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });

    }
}


exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
        return res.status(200).json({ status: true, message: "Notifications retrieved successfully", data: notifications});

    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}


exports.getNotificationByUser = async (req, res) => {
    try {
        const user = req.user;
        const notifications = await Notification.find({ user_id: user._id })
        const notificationsPromise = notifications.map(async (noti) => {
            const order = await Order.findById(noti.order_id);
            const orderDetails = await OrderDetail.find({order_id: order._id});
            return {
                ...noti._doc,
                order: {
                    order,
                    orderDetails,
                }
            }
        })

        const returnedNotifications = await Promise.all(notificationsPromise);
        return res.status(200).json({ status: true, message: "Notifications retrieved successfully", data: returnedNotifications});
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}