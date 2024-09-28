const mongoose = require("mongoose");
const paidHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  title: { type: String, required: true },
  money: { type: Number, required: true },
  point: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.paidHistories ||
  mongoose.model("paidHistory", paidHistorySchema);
