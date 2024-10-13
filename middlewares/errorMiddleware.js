const Order = require("../models/orderModel");
const Brands = require("../models/brandModel");

exports.checckBrandId = async (req, res, next) => {
  const { brandId } = req.params;
  if (!brandId) {
    return res.status(401).json({ status: false, message: "Id required" });
  }

  const brand = await Brands.findById({ _id: brandId });
  if (!brand) {
    return res.status(401).json({ status: false, message: "Brand not exits" });
  }

  req.brand = brand;
  next();
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
