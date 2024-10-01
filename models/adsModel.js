const mongoose = require("mongoose");
const adsSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  backgroundUrl: { type: String, required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  category: {
    type: String,
    enum: ["discount", "new_product", "promotion"],
    required: true,
  },
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

module.exports = mongoose.models.ads || mongoose.model("ads", adsSchema);
