const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
  orderDetail_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "orderDetail",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  reviewer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  responder_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  response: {
    content: { type: String },
    createdAt: { type: Date },
  },
  images: [{ type: String }],
  video: { type: String },
  size: { type: Number },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.reviews || mongoose.model("review", reviewSchema);
