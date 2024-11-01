const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  payment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "payment",
    required: true,
  },
  voucher_id: { type: mongoose.Schema.Types.ObjectId, ref: "voucher" },
  shipping_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "shipping",
  },
  orderDetails: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orderDetail",
    },
  ],
  total_price: { type: Number, required: true },
  canceller: { type: String },
  //Comfimed order
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "cancelled", "refunded"],
    default: "pending",
  },
  //Refund order
  returnRequest: {
    reason: { type: String },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "refunded"],
    },
    requestDate: { type: Date },
    responseDate: { type: Date },
  },
  receiver: { type: String, required: true },
  receiverPhone: { type: String, required: true },
  address: { type: String, required: true },
  timestamps: {
    placedAt: { type: Date, default: Date.now }, // Thời gian đặt hàng
    paidAt: { type: Date }, // Thời gian thanh toán
    shippedAt: { type: Date }, // Thời gian giao hàng
    deliveredAt: { type: Date }, // Thời gian nhận hàng
    completedAt: { type: Date }, // Thời gian hoàn tất đơn hàng
    cancelledAt: { type: Date }, // Thời gian hủy đơn hàng
    refundedAt: { type: Date }, //Thoi gian hoan don
    completedRefundedAt: { type: Date }, //Thoi gian hoan tat hoan don
  },
  points: { type: Number, default: 0 }, //Xu được sử dụng
});

module.exports = mongoose.models.orders || mongoose.model("order", orderSchema);
