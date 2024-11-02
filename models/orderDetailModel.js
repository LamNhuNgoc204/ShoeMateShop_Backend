const mongoose = require("mongoose");
const orderDetailSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
    required: true,
  },
  isReviewed: { type: Boolean, default: false },
  product: {
    id: { type: String, required: true },
    pd_image: [{ type: String, default: [] }],
    name: { type: String, required: true },
    size_name: { type: String, required: true },
    price: { type: Number, required: true },
    pd_quantity: { type: Number, required: true, min: 1 },
    size_id: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.orderDetails ||
  mongoose.model("orderDetail", orderDetailSchema);
