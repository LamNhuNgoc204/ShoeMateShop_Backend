const mongoose = require("mongoose");
const Size = require("../models/sizeModel");
const Brand = require("../models/brandModel");
const Review = require("../models/reviewModel");
const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel");
const Categories = require("../models/categoryModel");

// Thêm sản phẩm mới (Chỉ admin hoặc nhân viên)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      avatar,
      discount,
      brand,
      category,
      size,
      assets,
    } = req.body;

    if (!Array.isArray(size) || size.length === 0) {
      return res.status(400).json({ message: "Size must be provided" });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      avatar,
      discount,
      brand,
      category,
      size,
      assets, // assets là mảng URL
    });

    const savedProduct = await newProduct.save();

    const populatedProduct = await Product.findById(savedProduct._id)
      .populate("brand")
      .populate("category")
      .populate("size.sizeId");

    return res.status(201).json({ status: true, data: populatedProduct });
  } catch (error) {
    console.log("errorr==>", error);

    return res
      .status(500)
      .json({ status: false, message: "Error creating product", error });
  }
};

// Cập nhật sản phẩm theo ID (Chỉ admin hoặc nhân viên)
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      avatar,
      discount,
      brand,
      category,
      size,
      assets,
    } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        avatar,
        discount,
        brand,
        category,
        size,
        assets,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    )
      .populate("brand")
      .populate("category")
      .populate("size.sizeId");

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ status: true, data: updatedProduct });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Error updating product", error });
  }
};

// Lấy danh sách tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    let userId = req.user ? req.user._id : null;

    const products = await Product.find()
      .populate({
        path: "brand",
        select: "name",
      })
      .populate({
        path: "category",
        select: "name",
      })
      .populate({
        path: "size.sizeId",
        select: "name",
      });

    // Tính toán rating trung bình và số lượt đánh giá cho từng sản phẩm
    for (let product of products) {
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

    res.status(200).json({ data: products, status: true });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Error fetching products", error });
  }
};

exports.getAllBrands = async (_, res) => {
  try {
    const brands = await Brand.find();
    const products = await Product.find();

    const brandWithProducts = brands.map((brand) => {
      const productsInBrand = products.filter(
        (product) => product.brand.toString() === brand._id.toString()
      );

      return {
        ...brand.toObject(),
        products: productsInBrand,
      };
    });
    return res.status(200).json(brandWithProducts);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching products", error });
  }
};

exports.getAllCate = async (_, res) => {
  try {
    const categories = await Categories.find();
    const products = await Product.find();

    const categoriesWithProducts = categories.map((category) => {
      const productsInCategory = products.filter(
        (product) => product.category.toString() === category._id.toString()
      );

      return {
        ...category.toObject(),
        products: productsInCategory,
      };
    });
    return res.status(200).json(categoriesWithProducts);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching products", error });
  }
};

exports.getAllSize = async (_, res) => {
  try {
    const sizes = await Size.find();
    return res.status(200).json(sizes);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching products", error });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate({
        path: "brand",
        select: "name",
      })
      .populate({
        path: "category",
        select: "name",
      })
      .populate({
        path: "size.sizeId",
        select: "name",
      });

    if (userId) {
      const isFavorite = await Wishlist.exists({
        user_id: userId,
        product_id: id,
      });
      product._doc.isFavorite = !!isFavorite;
    } else {
      product._doc.isFavorite = false;
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Review.find({ product_id: product._id }).select(
      "rating"
    );

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const numOfReviews = reviews.length;
    const avgRating = numOfReviews
      ? (totalRating / numOfReviews).toFixed(1)
      : 0;

    product._doc.avgRating = avgRating;
    product._doc.numOfReviews = numOfReviews;

    const reviewsOfProduct = await Review.find({ product_id: product._id });
    product._doc.reviewsOfProduct = reviewsOfProduct;

    if (userId) {
      const isFavorite = await Wishlist.exists({
        user_id: userId,
        product_id: id,
      });
      product._doc.isFavorite = !!isFavorite;
    } else {
      product._doc.isFavorite = false;
    }

    return res.status(200).json(product);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching product", error });
  }
};

exports.searchProducts = async (req, res) => {
  const { query } = req.query;

  try {
    const products = await Product.find({
      $or: [
        { name: new RegExp(query, "i") },
        { description: new RegExp(query, "i") },
      ],
    })
      .populate("brand category size")
      .populate({
        path: "size",
        select: "name",
      });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error searching products", error });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.id;

    console.log("userid", userId, "productId", productId);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const existingWishlistItem = await Wishlist.findOne({
      user_id: userId,
      product_id: productId,
    });

    if (!existingWishlistItem) {
      const newWishlistItem = new Wishlist({
        user_id: userId,
        product_id: productId,
      });

      await newWishlistItem.save();
      return res
        .status(200)
        .json({ status: true, message: "Added to wishlist" });
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Removed from wishlist" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating wishlist", error });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    // console.log("userId", userId);
    const wishlistItems = await Wishlist.find({ user_id: userId }).populate(
      "product_id"
    );

    // console.log("wishlistItems", wishlistItems);

    for (const item of wishlistItems) {
      // console.log("item.product_id", item.product_id);

      const reviews = await Review.find({
        product_id: item.product_id._id,
      }).select("rating");

      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const numOfReviews = reviews.length;
      const avgRating = numOfReviews
        ? (totalRating / numOfReviews).toFixed(1)
        : 0;

      item._doc.avgRating = avgRating;
      item._doc.numOfReviews = numOfReviews;
      item._doc.isFavorite = true;
    }

    return res.status(200).json({ status: true, data: wishlistItems });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({
      status: false,
      message: "Error fetching wishlist",
      error: error,
    });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    // console.log("productId", productId);

    const existingWishlistItem = await Wishlist.findOne({
      user_id: userId,
      product_id: productId,
    });

    if (!existingWishlistItem) {
      return res.status(404).json({
        status: false,
        message: "Product not found in wishlist or already removed.",
      });
    }

    await Wishlist.deleteOne({ _id: existingWishlistItem._id });

    return res.status(200).json({
      status: true,
      message: "Product removed from wishlist successfully.",
    });
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    return res.status(500).json({
      status: false,
      message: "Error removing product from wishlist.",
      error: error.message,
    });
  }
};

exports.stopSelling = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }
    if (!["Đang kinh doanh", "Ngừng bán"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tìm thấy" });
    }

    product.status = status;
    product.updatedAt = Date.now();

    await product.save();

    return res.status(200).json({
      status: true,
      message: "Sản phẩm đã được tạm ngừng bán",
      data: product,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
