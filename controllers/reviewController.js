const Review = require("../models/reviewModel");
const OrderDetail = require("../models/orderDetailModel");
const Product = require("../models/productModel");

exports.createReview = async (req, res) => {
  try {
    const { orderDetail_id, product_id, rating, comment, images, video } =
      req.body;

    const reviewer_id = req.user._id;

    const orderdetail = await OrderDetail.findById(orderDetail_id);
    if (!orderdetail) {
      return res
        .status(400)
        .json({ status: false, message: "Order detail not found" });
    }

    const product = await Product.findById(product_id);
    if (!product) {
      return res
        .status(400)
        .json({ status: false, message: "Product detail not found" });
    }

    const newReview = new Review({
      orderDetail_id,
      product_id,
      reviewer_id,
      rating,
      comment,
      images,
      video,
    });
    await newReview.save();

    return res.status(200).json({
      status: true,
      message: "Review created successfully.",
      data: newReview,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// for admin
exports.updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    let review;

    if (status === "rejected") {
      review = await Review.findByIdAndDelete(reviewId);

      if (!review) {
        return res
          .status(400)
          .json({ status: false, message: "Review not found" });
      }

      return res.status(200).json({
        status: true,
        message: "Review rejected and deleted successfully",
      });
    } else {
      review = await Review.findByIdAndUpdate(
        reviewId,
        { status },
        { new: true }
      );

      if (!review) {
        return res
          .status(400)
          .json({ status: false, message: "Review not found" });
      }

      return res.status(200).json({
        status: true,
        message: "Review approved successfully",
        data: review,
      });
    }
  } catch (error) {
    console.error("Error updating review status:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// For admin
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    return res.status(200).json({
      status: true,
      message: "Retrieved all reviews",
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// For admin
exports.getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: "pending" });
    return res
      .status(200)
      .json({ status: true, message: "Get reviews pending", data: reviews });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Get review detail
exports.getReviewById = async (req, res) => {
  try {
    const review = req.review;

    return res.status(200).json({
      status: true,
      message: "Retrieved review successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// get list review's product
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = req.review;
    return res.status(200).json({
      status: true,
      message: "Get product review successfully",
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Update product review
exports.updateProductReview = async (req, res) => {
  try {
    const { rating, comment, images, video } = req.body;

    const review = req.review;

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.images = images || review.images;
    review.video = video || review.video;
    await review.save();

    return res.status(200).json({
      status: true,
      message: "Update review successfully",
      data: review,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ", error: error.message });
  }
};
