const OrderDetail = require("../models/orderDetailModel");

exports.checkOrderDetail = async (req, res, next) => {
  const { orderDetailId } = req.params;

  if (!orderDetailId) {
    return res.status(400).json({
      status: false,
      message: "Order detail id is required",
    });
  }

  const orderDetail = await OrderDetail.findById(orderDetailId);
  if (!orderDetail) {
    return res.status(400).json({
      status: false,
      message: "Order detail not found ",
    });
  }

  req.orderDetail = orderDetail;

  next();
};
