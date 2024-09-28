const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
  payment_method: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.payments || mongoose.model("payment", paymentSchema);
