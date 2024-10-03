const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  text: { type: String, required: true },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
    required: false,
    default: null, 
  },
  isRead: { type: Boolean, default: false },
  createAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.messages || mongoose.model("message", messageSchema);
