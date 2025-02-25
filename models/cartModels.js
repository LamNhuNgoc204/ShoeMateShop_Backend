const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  quantity: { type: Number, required: true, default: 1 },
  size_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "size",
    required: true,
  },
  createAt: { type: Date, default: Date.now },
  updateAt: { type: Date },
});

module.exports = mongoose.models.carts || mongoose.model("cart", cartSchema);
