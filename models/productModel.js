const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 },
  sold: { type: Number, default: 0, min: 0 },
  assets: [{ type: String }],
  brand: { type: mongoose.Schema.Types.ObjectId, ref: "brand", required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
    required: true,
  },
  size: [
    {
      sizeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "size",
        required: true,
      },
      quantity: { type: Number, required: true, min: 0 },
    },
  ],
  status: {
    type: String,
    enum: ["Còn hàng", "Hết hàng", "Ngừng bán"],
    default: "Còn hàng",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.products || mongoose.model("product", productSchema);
