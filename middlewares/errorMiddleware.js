const Order = require("../models/orderModel");
const Brands = require("../models/brandModel");
const mongoose = require("mongoose");

exports.checckBrandId = async (req, res, next) => {
  const { brandId } = req.params;
  if (!brandId) {
    return res.status(401).json({ status: false, message: "Id required" });
  }

  if (!mongoose.isValidObjectId(brandId)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid ID format." });
  }

  try {
    const brand = await Brands.findById(brandId);
    if (!brand) {
      return res
        .status(404)
        .json({ status: false, message: "Brand does not exist." });
    }
    req.brand = brand;
    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// exports.checkOrderDetail = async (req, res, next) => {
//   const { orderDetailId } = req.params;

//   if (!orderDetailId) {
//     return res.status(400).json({
//       status: false,
//       message: "Order detail id is required",
//     });
//   }

//   const orderDetail = await OrderDetail.findById(orderDetailId);
//   if (!orderDetail) {
//     return res.status(400).json({
//       status: false,
//       message: "Order detail not found ",
//     });
//   }

//   req.orderDetail = orderDetail;

//   next();
// };

exports.checkOrder = async (req, res, next) => {
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({
      status: false,
      message: "Order id is required",
    });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(400).json({ status: false, message: "Order not found" });
  }

  req.order = order;

  next();
};
