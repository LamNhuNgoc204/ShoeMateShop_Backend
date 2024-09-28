const mongoose = require("mongoose");
const voucherSchema = new mongoose.Schema({
  discount_value: { type: Number, required: true },
  voucher_name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  voucher_image: { type: String },
  voucher_code: { type: String, required: true, unique: true },
  expiry_date: { type: Date, required: true },
  usage_conditions: { type: String },
  usage_scope: { type: String },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  isInMiniGame: { type: Boolean, default: false },
  createAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.vouchers || mongoose.model("voucher", voucherSchema);
