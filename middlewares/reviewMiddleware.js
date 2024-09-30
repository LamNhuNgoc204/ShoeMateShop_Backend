exports.createReview = (req, res, next) => {
  const { orderDetail_id, product_id, rating } = req.body;

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

  next();
};
