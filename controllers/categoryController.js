const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const Review = require("../models/reviewModel");
const Wishlist = require("../models/wishlistModel");

exports.createCategory = async (req, res) => {
  try {
    const { name, image, description } = req.body;
    // const existCategory = await Category.findOne({ name: name });
    const existCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
    if (existCategory) {
      return res
        .status(402)
        .json({ status: false, message: "Category name already exists!" });
    }
    const savedCategory = await Category.create({
      name,
      image,
      description,
    });

    return res.status(200).json({
      status: true,
      message: "Category created successfully",
      data: savedCategory,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.categories._id;

    const productsInCategory = await Product.find({ category: categoryId });
    if (productsInCategory.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Không thể xóa danh mục vì vẫn còn sản phẩm liên quan!",
      });
    }

    await Category.findByIdAndDelete(categoryId);
    return res
      .status(200)
      .json({ status: true, message: "Category deleted successfully!" });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, image, description } = req.body;
    const category = req.categories;
    if (name) {
      category.name = name;
    }
    if (image) {
      category.image = image;
    }
    category.description = description;

    const updatedCategory = await category.save();
    return res.status(200).json({
      status: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const skip = (page - 1) * limit;

    const totalCategories = await Category.countDocuments();

    const categories = await Category.find({}).skip(skip).limit(limit);

    const totalPages = Math.ceil(totalCategories / limit);

    return res.status(200).json({
      status: true,
      message: "Categories retrieved successfully",
      data: categories,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalCategories,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = req.categories;
    if (!category) {
      return res
        .status(400)
        .json({ status: false, message: "Category not found!" });
    }
    return res.status(200).json({
      status: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getProductOfCate = async (req, res) => {
  try {
    let userId = req.user !== null ? req.user._id : null;
    const categoryId = req.categories._id;

    const productOfCate = await Product.find({ category: categoryId })
      .populate("brand", "name")
      .populate("size.sizeId", "name");

    for (let product of productOfCate) {
      const reviews = await Review.find({ product_id: product._id }).select(
        "rating"
      );

      // Tính tổng rating và số lượng đánh giá
      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const numOfReviews = reviews.length;
      const avgRating = numOfReviews
        ? (totalRating / numOfReviews).toFixed(1)
        : 0;

      // Gán rating trung bình và số lượt đánh giá vào sản phẩm
      product._doc.avgRating = avgRating;
      product._doc.numOfReviews = numOfReviews;

      // Kiểm tra sp có thuộc trong danh sách yêu thích của user không
      if (userId) {
        const isFavorite = await Wishlist.exists({
          user_id: userId,
          product_id: product._id,
        });
        product._doc.isFavorite = !!isFavorite;
      } else {
        product._doc.isFavorite = false;
      }
    }

    return res.status(200).json({
      status: true,
      message: "Get product of cate success",
      data: productOfCate,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
