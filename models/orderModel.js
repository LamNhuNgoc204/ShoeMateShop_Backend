const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  payment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "payment",
    required: true,
  },
  voucher_id: { type: mongoose.Schema.Types.ObjectId, ref: "voucher" },
  status: {
    type: String,
    enum: ["pending", "completed", "canceled"],
    default: "pending",
  },
  total_price: { type: Number, required: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  receiver: { type: String, required: true },
  receiverPhone: { type: String, required: true },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.orders || mongoose.model("order", orderSchema);
