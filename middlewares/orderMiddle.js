const { isValidPhoneNumber } = require("../utils/numberUtils");
const Order = require("../models/orderModel");

const validateOrder = (req, res, next) => {
  const { products, method_id, total_price, receiver, receiverPhone, address } =
    req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      status: false,
      message: "Products are required and must be an array.",
    });
  }

  if (!method_id) {
    return res
      .status(400)
      .json({ status: false, message: "Payment method is required." });
  }

  if (typeof total_price !== "number" || total_price <= 0) {
    return res
      .status(400)
      .json({ status: false, message: "Total price must be greater than 0." });
  }

  if (!receiver) {
    return res
      .status(400)
      .json({ status: false, message: "Receiver name is required." });
  }

  if (!isValidPhoneNumber(receiverPhone)) {
    return res.status(400).json({
      status: false,
      message: "Valid receiver phone number is required.",
    });
  }

  if (!address) {
    return res
      .status(400)
      .json({ status: false, message: "Address is required." });
  }

  next();
};

const checkUserOrder = async (req, res, next) => {
  const userId = req.user._id;

  const order = await Order.find({ user_id: userId })
    .populate("payment_id.payment_method_id", "payment_method")
    .populate(
      "voucher_id",
      "discount_value voucher_name min_order_value max_discount_value"
    )
    .populate("shipping_id", "name cost createdAt updatedAt");

  if (!order) {
    return res.status(404).json({ status: false, message: "Order not found!" });
  }

  req.order = order;
  next();
};

const checkOrderUpdate = async (req, res, next) => {
  const { orderId } = req.params;
  const { receiver, receiverPhone, address } = req.body;

  if (!isValidPhoneNumber(receiverPhone)) {
    return res.status(404).json({ status: false, message: "Invalid phone!" });
  }

  if (!receiver) {
    return res
      .status(404)
      .json({ status: false, message: "Rêciver is required!" });
  }

  if (!address) {
    return res
      .status(404)
      .json({ status: false, message: "Rêciver is required!" });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ status: false, message: "Order not found!" });
  }

  req.order = order;
  next();
};

module.exports = { validateOrder, checkUserOrder, checkOrderUpdate };
