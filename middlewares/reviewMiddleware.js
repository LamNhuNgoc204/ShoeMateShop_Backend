const Review = require("../models/reviewModel");

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
