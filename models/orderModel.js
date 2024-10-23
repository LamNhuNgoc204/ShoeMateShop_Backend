const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  payment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "payment",
    required: true,
  },
  voucher_id: { type: mongoose.Schema.Types.ObjectId, ref: "voucher" },
  shipping_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "shipping",
  },
  total_price: { type: Number, required: true },
  //Comfimed order
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled", "refunded"],
    default: "pending",
  },
  //Refund order
  refund: {
    reason: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "refunded"],
    },
    requestDate: { type: Date, default: Date.now },
    responseDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  receiver: { type: String, required: true },
  receiverPhone: { type: String, required: true },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.orders || mongoose.model("order", orderSchema);
