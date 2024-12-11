const Size = require("../models/sizeModel");
const Product = require("../models/productModel");

exports.createSize = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: false,
        message: "Name is required",
      });
    }

    const checkSize = await Size.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (checkSize) {
      return res.status(400).json({
        status: false,
        message: "This size is exits",
      });
    }

    const newSize = new Size({
      name,
    });

    await newSize.save();

    return res.status(200).json({
      status: true,
      message: "Create successully",
      data: newSize,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getAllSizes = async (_, res) => {
  try {
    const data = await Size.find();

    return res
      .status(200)
      .json({ status: true, message: "get size success", data: data });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getLstProductbySize = async (req, res) => {
  try {
    const { sizeId } = req.params;
    if (!sizeId) {
      return res.status(400).json({
        status: false,
        message: "Size id required!",
      });
    }
    const products = await Product.find({ "size.sizeId": sizeId })
      .populate("brand")
      .populate("category")
      .populate("size.sizeId");

    if (products.length === 0) {
      return res.status(200).json({
        status: true,
        data: [],
        message: "No products found for this size",
      });
    }

    return res.status(200).json({ status: true, data: products });
  } catch (error) {
    console.log("Error fetching products by size:", error);
    return res
      .status(500)
      .json({ status: false, message: "Error fetching products", error });
  }
};

exports.deleteSize = async (req, res) => {
  try {
    const { sizeId } = req.params;
    if (!sizeId) {
      return res.status(400).json({ status: false, message: "ID required" });
    }

    const productsInSize = await Product.find({ "size.sizeId": sizeId });
    if (productsInSize.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Không thể xóa danh mục vì vẫn còn sản phẩm liên quan!",
      });
    }

    await Size.findByIdAndDelete(sizeId);

    return res.status(200).json({
      status: true,
      message: "Size deleted successfully!",
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
