const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, 
  balance: { type: Number, default: 0 }, 
  PIN: { type: String, required: true }, 
  isActive: { type: Boolean, default: false }, 
  transactions: [
    {
      transactionId: { type: String, required: true },
      type: { type: String, enum: ["deposit", "transfer", "payment"], required: true },
      amount: { type: Number, required: true },
      recipientEmail: { type: String }, 
      message: { type: String, default: "" },
      senderName: { type: String }, 
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.wallet || mongoose.model("wallet", walletSchema);
