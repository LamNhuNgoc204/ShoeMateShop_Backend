const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  payment_method_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "paymentMethod",
    required: true,
  },
  order_ids: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
    },
  ],
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  amount: { type: Number, required: true },
  //ID giao dịch
  transaction_id: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.payments || mongoose.model("payment", paymentSchema);
