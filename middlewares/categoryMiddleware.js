const Category = require("../models/categoryModel");

exports.checkCateId = async (req, res, next) => {
  const { categoryId } = req.params;
  if (!categoryId) {
    return res
      .status(400)
      .json({ status: false, message: "Category ID is required!" });
  }
  const category = await Category.findById(categoryId);
  if (!category) {
    return res
      .status(400)
      .json({ status: false, message: "Category not found!" });
  }
  req.categories = category;
  next();
};

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
    const { categoryId } = req.params;
    const { name, image } = req.body;
    if (!categoryId) {
      return res.status(401).json({
        status: false,
        message: "Category ID is required!",
      });
    }
    if (!name && !image) {
      return res.status(402).json({
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
