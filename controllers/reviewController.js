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
