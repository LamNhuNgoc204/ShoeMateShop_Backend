const Review = require("../models/reviewModel");
const Product = require("../models/productModel");

exports.createReview = (req, res, next) => {
  const { orderDetail_id, product_id, rating, comment } = req.body;

  if (!orderDetail_id || !product_id) {
    return res
      .status(400)
      .json({ status: false, message: "All id is required!" });
  }

  if (rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ status: false, message: "Rating must be between 1 and 5!" });
  }

  if (checkBadWord(comment)) {
    return res.status(400).json({
      status: false,
      message: "Comment contains inappropriate language!",
    });
  }

  next();
};

exports.checkUpdateReview = (req, res, next) => {
  const { reviewId } = req.params;
  const { status } = req.body;

  if (!reviewId) {
    return res.status(400).json({
      status: false,
      message: "Review id is required",
    });
  }

  if (!status) {
    return res.status(400).json({
      status: false,
      message: "Status is required",
    });
  }

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ status: false, message: "Invalid status" });
  }

  next();
};

exports.checkReviewById = async (req, res, next) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    return res.status(400).json({ status: false, message: "Review not found" });
  }

  req.review = review;

  next();
};

exports.checkProductById = async (req, res, next) => {
  const { productId } = req.params;
  if (!productId) {
    return res.status(400).json({
      status: false,
      message: "Product id is required",
    });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(400).json({
      status: false,
      message: "Product not found",
    });
  }

  const reviews = await Review.find({ productId })
    .populate("userId", "name email avatar")
    .sort({ createdAt: -1 });

  req.review = reviews;
  next();
};

exports.checkUserUpdateReview = async (req, res, next) => {
  const { productId, reviewId } = req.params;
  const userId = req.user._id;

  if (!productId) {
    return res.status(400).json({
      status: false,
      message: "Product id is required",
    });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      status: false,
      message: "Product not found",
    });
  }

  if (!reviewId) {
    return res.status(400).json({
      status: false,
      message: "Review id is required",
    });
  }

  const review = await Review.findOne({
    _id: reviewId,
    product_id: productId,
    reviewer_id: userId,
  });

  if (!review) {
    return res.status(400).json({
      status: false,
      message: "Review not found",
    });
  }

  req.review = review;

  next();
};

exports.checkUserProductReview = async (req, res, next) => {
  const userId = req.user._id;

  if (!userId) {
    return res.status(400).json({
      status: false,
      message: "User ID is required",
    });
  }

  const reviews = await Review.find({ reviewer_id: userId })
    .lean()
    .populate("product_id", "name price assets")
    .populate("reviewer_id", "name email avatar")
    .sort({ createdAt: -1 });

  req.reviews = reviews;

  next();
};
