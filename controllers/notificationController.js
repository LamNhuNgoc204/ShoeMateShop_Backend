const Order = require('../models/orderModel')
const User = require('../models/userModel')
const Notification = require('../models/notificationModel')

exports.createNotification = async (req, res) => {
    try {
        const { userId, orderId, content } = req.body;
    
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: false, message: "User not found" });
        }
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ status: false, message: "Order not found" });
        }
        const savedNotification = await Notification.create({
            order_id:userId,
            user_id:orderId,
            content
        })
        return res.status(201).json({ status: true, message: "Notification created successfully", data: savedNotification });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}


exports.readNotification = async (req, res) => {
    try {
        const  { id }= req.params
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


