const Conversation = require('../models/conversationModel');
const User = require('../models/userModel');

exports.validateSendMessage = async (req, res, next) => {
    try {
        const {conversationId, senderId, orderId, text} = req.body;
        if (!conversationId) {
            return res.status(400).json({
                status: false,
                message: 'Conversation ID is required!'
            });
        }
        if (!senderId) {
            return res.status(400).json({
                status: false,
                message: 'Sender ID is required!'
            });
        }
        if (!orderId || !text) {
            return res.status(400).json({
                status: false,
                message: 'Order ID and Text are required!'
            });
        }
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: 'Internal server error!'
        })
    }
}


exports.validateJoinMessage = async (req, res, next) => {
    try {
        const {conversationId, staffId }= req.body;
        if (!conversationId) {
            return res.status(400).json({
                status: false,
                message: 'Conversation ID is required!'
            });
        }
        const conversation = await Conversation.findById(conversationId)
        if (!conversation) {
            return res.status(404).json({
                status: false,
                message: 'Conversation not found!'
            });
        }
        if(conversation.staffId != null) {
            return res.status(400).json({
                status: false,
                message: 'This conversation has already been joined!'
            });
        }
        if (!staffId) {
            return res.status(400).json({
                status: false,
                message: 'Staff ID is required!'
            });
        }
        const staff = await User.findById(staffId)
        
        if (!staff) {
            return res.status(404).json({
                status: false,
                message: 'Staff not found!'
            });
        }
        if(staff.role != 'employee') {
            return res.status(400).json({
                status: false,
                message: 'This user is not an staff!'
            });
        }
        req.staff = staff;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: 'Internal server error!'
        })
    }
}

exports.validateLeaveMessage = async (req, res, next) => {
    try {
        const { conversationId, staffId } = req.body;
        if (!conversationId) {
            return res.status(400).json({
                status: false,
                message: 'Conversation ID is required!'
            });
        }
        const conversation = await Conversation.findById(conversationId)
        if (!conversation) {
            return res.status(404).json({
                status: false,
                message: 'Conversation not found!'
            });
        }
        if(!conversation.staffId) {
            return res.status(400).json({
                status: false,
                message: 'This conversation has not been joined yet!'
            });
        }
        if (!staffId) {
            return res.status(400).json({
                status: false,
                message: 'Staff ID is required!'
            });
        }
        const staff = await User.findById(staffId)
        
        if (!staff) {
            return res.status(404).json({
                status: false,
                message: 'Staff not found!'
            });
        }
        if(staff.role!= 'employee') {
            return res.status(400).json({
                status: false,
                message: 'This user is not an staff!'
            });
        }
        if(conversation.staffId.toString()!== staffId.toString()) {
            return res.status(400).json({
                status: false,
                message: 'This user is not the staff who joined this conversation!'
            });
        }
        req.staff = staff;
        next();
    } catch (error) {
        
    }
}


exports.validateCreateConversation = async (req, res, next) => {
    try {
        const user = req.user;
        const conversation= await Conversation.find({userId: user._id});
        if(conversation.length>0) {
            return res.status(200).json({
                status: true,
                message: 'You have already joined a conversation with this user!',
                data: conversation[0]
            });
        }
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            message: 'Internal server error!'
        })
    }
}


