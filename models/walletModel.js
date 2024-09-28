const mongoose = require("mongoose");
const walletSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  money: { type: Number, default: 0 },
  point: { type: Number, default: 0 },
  pin: { type: String, required: true },
});

module.exports =
  mongoose.models.wallets || mongoose.model("wallet", walletSchema);
