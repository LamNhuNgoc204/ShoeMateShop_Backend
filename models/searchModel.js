const mongoose = require("mongoose");

const searchSchema = new mongoose.Schema({
  content: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  createAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.searchs || mongoose.model("search", searchSchema);
