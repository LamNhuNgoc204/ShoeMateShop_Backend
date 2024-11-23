const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
  avatar: {
    type: String,
    default:
      "https://i.pinimg.com/enabled_hi/564x/d4/35/42/d435423c9386e708c678b7663656b9c0.jpg",
  },
  password: { type: String, required: true },
  passwordOTP: { type: String },
  passwordOTPExpire: { type: Date },
  name: { type: String, required: true },
  role: { type: String, enum: ["admin", "user", "employee"], default: "user" },
  device_info: { type: Object },
  isVerified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpires: { type: Date },
  searchHistory :{
    type: [String],
    default: [],
  },
  FCMToken: { type: String, default: ""},
  isActive: { type: Boolean, default: true },
  createAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.users || mongoose.model("user", userSchema);
