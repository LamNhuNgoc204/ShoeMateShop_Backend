const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  payment_method: { type: String, required: true },
  image: { type: String },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
  },
  amount: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.payments || mongoose.model("payment", paymentSchema);
