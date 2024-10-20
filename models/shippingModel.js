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
  trackingAvailable: {
    type: Boolean,
    default: false,
  },
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
