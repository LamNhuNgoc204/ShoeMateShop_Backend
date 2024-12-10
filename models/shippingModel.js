const mongoose = require("mongoose");

const shippingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  deliveryTime: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  order_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order",
    },
  ],
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports =
  mongoose.models.shipping || mongoose.model("shipping", shippingSchema);
