const Brands = require("../models/brandModel");
const Product = require("../models/productModel");

exports.createBrand = async (req, res) => {
  try {
    const { name, image } = req.body;
    const existBrand = await Brands.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existBrand) {
      return res
        .status(402)
        .json({ status: false, message: "Brand name already exists!" });
    }
    const newBrand = await Brands.create({
      name,
      image,
    });

    return res.status(200).json({
      status: true,
      message: "Brand created successfully",
      data: newBrand,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getAllProductOfBrand = async (req, res) => {
  try {
    const brandId = req.brand._id;

    const productOfBrand = await Product.find({ brand: brandId })
      .populate("category", "name")
      .populate("size.sizeId", "name");

    return res.status(200).json({
      status: true,
      message: "Get product of brand success",
      data: productOfBrand,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const brandId = req.brand._id;
    const { image } = req.body;

    const updatedBrand = await Brands.findByIdAndUpdate(
      brandId,
      { image: image },
      { new: true, runValidators: true }
    );

    if (!updatedBrand) {
      return res
        .status(404)
        .json({ status: false, message: "Thương hiệu không tìm thấy" });
    }

    return res
      .status(200)
      .json({ status: true, message: "update success", data: updatedBrand });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getAllBrand = async (req, res) => {
  try {
    const brand = await Brands.find({});
    return res.status(200).json({
      status: true,
      message: "Get all brand success",
      data: brand,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    const products = await Product.find({ brand: brandId });

    if (products.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Không thể xóa danh mục vì vẫn còn sản phẩm liên quan!",
      });
    }

    const deletedBrand = await Brands.findByIdAndDelete(brandId);

    if (!deletedBrand) {
      return res.status(404).json({ message: "Brand not found." });
    }

    return res
      .status(200)
      .json({ status: true, message: "Brand deleted successfully." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error });
  }
};
