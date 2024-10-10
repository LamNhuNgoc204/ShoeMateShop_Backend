const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Message = require('../models/messageModel');
const { getIo } = require('../socket');

exports.sendMessage = async (req, res) => {
    try {
        const { senderId, recieverId, orderId, text } = req.body;
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ status: false, message: "User not found" });
        }
        const receiver = await User.findById(recieverId)
        if (!receiver) {
            return res.status(404).json({ status: false, message: "User not found" });
        }
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ status: false, message: "Order not found" });
        }
        const message = await Message.create({
            sender_id: senderId,
            receiver_id: recieverId,
            order_id: orderId,
            text
        })

        getIo().emit("sendMessage", {
            message: message
        })

        return res.status(200).json({ status: true, message: "Message sent successfully", data: message });

    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}