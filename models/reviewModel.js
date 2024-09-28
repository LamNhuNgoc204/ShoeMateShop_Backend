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
    required: true,
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  response: {
    content: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  assets: [{ type: mongoose.Schema.Types.ObjectId, ref: "asset" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.reviews || mongoose.model("review", reviewSchema);
