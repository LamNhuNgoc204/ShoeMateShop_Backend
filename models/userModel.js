const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordOTP: { type: String },
  passwordOTPExpire: { type: Date },
  name: { type: String, required: true },
  role: { type: String, default: "user" },
  device_info: { type: Object },
  wallet: { type: mongoose.Schema.Types.ObjectId, ref: "wallet" },
  address: [{ type: mongoose.Schema.Types.ObjectId, ref: "address" }],
  search: [{ type: mongoose.Schema.Types.ObjectId, ref: "search" }],
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "cart" }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "wishlist" }],
  createAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.users || mongoose.model("user", userSchema);
