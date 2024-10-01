const mongoose = require("mongoose");
const orderDetailSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
    required: true,
  },
  size_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "size",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  size_name: { type: String, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.orderDetails ||
  mongoose.model("orderDetail", orderDetailSchema);
