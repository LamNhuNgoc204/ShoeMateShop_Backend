const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Message = require('../models/messageModel');
const { getIo } = require('../socket');
const Conversation = require('../models/conversationModel');
const orderDetailModel = require('../models/orderDetailModel');
const Product = require('../models/productModel');
const { sendNotification } = require('../firebase');

const getLastMesssage = async (conversationId) => {
    const message = await Message.find({ conversationId }).sort({ createdAt: -1 }).limit(1);
    if (!message.length) return null;
    return message[0];
}

const sortConversation = (conversations) => {
    const sortedConversations = conversations.sort((a, b) => {
        if (a.lastMessage && b.lastMessage) {
            const aDate = new Date(a.lastMessage.createdAt);
            const bDate = new Date(b.lastMessage.createdAt);
            return bDate.getTime() - aDate.getTime();
        }
    })
    return sortedConversations;
}



exports.sendMessage = async (req, res) => {
    try {
        var { conversationId, senderId, text, orderId, productId } = req.body;
        const conversation = await Conversation.findById(conversationId);
        const user = await User.findById(conversation.userId);
        if (!conversation) {
            return res.status(404).json({ status: false, message: "Conversation not found" });
        }
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ status: false, message: "User not found" });
        }
        if (orderId) {
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({ status: false, message: "Order not found" });
            }
        }
        var type;
        if (orderId) {
            type = 'order'
        }
        else if (productId) {
            type = 'product'
        }
        else {
            type = 'text'
        }
        const message = await Message.create({
            conversationId: conversationId,
            type: type,
            senderId: senderId,
            text: text,
            orderId: orderId,
            productId: productId
        })

        if (orderId) {
            const order = await Order.findById(orderId);
            const orderDetails = await orderDetailModel.find({ order_id: order._id })
            getIo().emit('sendMessage', {
                message: {
                    ...message._doc,
                    senderId: {
                        _id: senderId,
                        name: sender.name,
                        avatar: sender.avatar,
                    },
                    order: {
                        order, orderDetails
                    }
                }

            })
        } 
        else if(productId) {
        const product = await Product.findById(productId);
            getIo().emit('sendMessage', {
                message: {
                    ...message._doc,
                    senderId: {
                        _id: senderId,
                        name: sender.name,
                        avatar: sender.avatar
                    },
                    product: product
                }
            })
        } 
        else {
            getIo().emit('sendMessage', {
                message: {
                    ...message._doc,
                    senderId: {
                        _id: senderId,
                        name: sender.name,
                        avatar: sender.avatar
                    }
                }

            })

        }

        if(senderId != user._id) {
            await sendNotification(user.FCMToken, 'MateShoe Staff 📝', text)
        }



        return res.status(200).json({ status: true, message: "Message sent successfully", data: message });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}

exports.joinConversation = async (req, res) => {
    try {
        const { conversationId, staffId } = req.body;
        const staff = await req.staff;
        const conversation = await Conversation.findById(conversationId);
        conversation.staffId = staffId;
        await conversation.save();
        const notify = await Message.create({
            conversationId: conversationId,
            type: 'notify',
            senderId: staff._id,
            text: `${staff.name} joined the conversation`
        })
        getIo().emit('sendMessage', {
            message: {
                ...notify._doc,
                senderId: {
                    name: staff.name,
                    avatar: staff.avatar
                }
            }
        })
        getIo().emit('joinConversation', {
            conversationId: conversationId,
            staffId: staffId
        })
        return res.status(200).json({ status: true, message: "User joined conversation successfully", data: conversation });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}

exports.leaveConversation = async (req, res) => {
    try {
        const { conversationId, staffId } = req.body;
        const staff = await req.staff;
        const conversation = await Conversation.findById(conversationId);
        conversation.staffId = null;
        await conversation.save();
        const notify = await Message.create({
            conversationId: conversationId,
            type: 'notify',
            senderId: staff._id,
            text: `${staff.name} left the conversation`
        })
        getIo().emit('sendMessage', {
            message: {
                ...notify._doc,
                senderId: {
                    name: staff.name,
                    avatar: staff.avatar
                }
            }
        })
        getIo().emit('leaveConversation', {
            conversationId: conversationId,
            staffId: staffId
        })
        return res.status(200).json({ status: true, message: "User left conversation successfully", data: conversation });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}


exports.createConversation = async (req, res) => {
    try {
        const user = req.user;
        const conversation = await Conversation.create({
            userId: user._id
        })
        getIo().emit('createConversation', {
            conversation: conversation._doc
        })
        return res.status(200).json({ status: true, message: "Conversation created successfully", data: conversation });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}


exports.getConversations = async (req, res) => {
    try {
        const user = req.user;
        const conversations = await Conversation.find({
            $or: [
                { staffId: user._id },
                { userId: user._id }
            ]
        });
        return res.status(200).json({ status: true, message: "Get conversations successfully", data: conversations });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}

exports.getMessages = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;
        const messages = await Message.find({ conversationId: conversationId }).sort({ createdAt: -1 }).populate('senderId', 'name avatar');
        const messagePromises = messages.map(async message => {
            if (message.orderId) {
                const order = await Order.findById(message.orderId);
                const orderDetails = await orderDetailModel.find({ order_id: order._id });
                return {
                    ...message._doc,
                    order: {
                        order,
                        orderDetails
                    }
                }
            } 
            else if(message.productId) {
                const product =await Product.findById(message.productId);
                return {
                   ...message._doc,
                    product: product
                }
            }
            else {
                return message._doc
            }
        })

        const returnedMessages = await Promise.all(messagePromises);
        return res.status(200).json({ status: true, message: "Get messages successfully", data: returnedMessages });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}


exports.getAllConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({}).populate('userId', 'name avatar');
        const mapConversation = conversations.map(async (conversation) => {
            const lastMessage = await getLastMesssage(conversation._id);
            return {
                ...conversation._doc,
                lastMessage: lastMessage
            }
        })

        const doneConversations = await Promise.all(mapConversation)
        const conversationsHasLastMessage = doneConversations.filter((conversation) => conversation.lastMessage != null);

        const sortedConverations = sortConversation(conversationsHasLastMessage);


        return res.status(200).json({ status: true, message: "Get all conversations successfully", data: sortedConverations });
    } catch (error) {

    }
}


exports.getConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const conversation = await Conversation.findById(conversationId).populate('userId', 'name avatar');
        if (!conversation) {
            return res.status(404).json({ status: false, message: "Conversation not found" });
        }
        const lastMessage = await getLastMesssage(conversationId);
        return res.status(200).json({ status: true, message: "Get conversation successfully", data: { ...conversation._doc, lastMessage: lastMessage } });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
}