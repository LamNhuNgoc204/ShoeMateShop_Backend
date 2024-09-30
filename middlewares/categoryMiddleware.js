exports.validateUpdateMiddleware = async (req, res, next) => {
    try {
        const { name, image } = req.body;
        if(!name) {
            return res.status(400).json({
                status: false,
                message: 'Name is required!'
            });
        }
        if(!image) {
            return res.status(400).json({
                status: false,
                message: 'Image is required!'
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