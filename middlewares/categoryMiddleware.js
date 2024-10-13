exports.validateCreateCategory = async (req, res, next) => {
  try {
    const { name, image } = req.body;
    if (!name) {
      return res.status(403).json({
        status: false,
        message: "Name is required!",
      });
    }
    if (!image) {
      return res.status(404).json({
        status: false,
        message: "Image is required!",
      });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal server error!",
    });
  }
};

exports.validateUpdateCategory = async (req, res, next) => {
  try {
    const { categoryId, name, image } = req.body;
    if (!categoryId) {
      return res.status(400).json({
        status: false,
        message: "Category ID is required!",
      });
    }
    if (!name && !image) {
      return res.status(400).json({
        status: false,
        message: "At least one field (name or image) is required!",
      });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: "Internal server error!",
    });
  }
};
