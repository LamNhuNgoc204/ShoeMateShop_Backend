const mongoose = require("mongoose");
const sizeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.sizes || mongoose.model("size", sizeSchema);
