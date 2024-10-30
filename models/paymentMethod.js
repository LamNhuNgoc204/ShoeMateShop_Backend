const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema({
  payment_method: { type: String, required: true },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
});

module.exports =
  mongoose.models.paymentMethod ||
  mongoose.model("paymentMethod", paymentMethodSchema);
