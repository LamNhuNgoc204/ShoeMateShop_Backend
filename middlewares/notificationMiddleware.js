exports.validateCreateNotification = async (req, res, next) => {
    try {
        const { userId, content, orderId } = req.body;
        if (!userId) {
            return res.status(400).json({
                status: false,
                message: 'User ID is required!'
            });
        }
        if (!content) {
            return res.status(400).json({
                status: false,
                message: 'Content is required!'
            });
        }
        if(!orderId) {
            return res.status(400).json({
                status: false,
                message: 'Order ID is required!'
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