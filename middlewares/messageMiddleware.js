exports.validateSendMessage = async (req, res, next) => {
    try {
        const { senderId, recieverId, text, orderId} = req.body;
        if (!senderId) {
            return res.status(400).json({
                status: false,
                message: 'Sender ID is required!'
            });
        }
        if (!recieverId) {
            return res.status(400).json({
                status: false,
                message: 'Reciever ID is required!'
            });
        }
        if (!text && !orderId) {
            return res.status(400).json({
                status: false,
                message: 'Text or Order ID is required!'
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