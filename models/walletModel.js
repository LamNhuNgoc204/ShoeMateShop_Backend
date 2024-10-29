const mongoose = require("mongoose");
const walletSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  balance: { type: Number, default: 0 },
  point: { type: Number, default: 0 },
  pin: { type: String, required: true },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.wallets || mongoose.model("wallet", walletSchema);
