const mongoose = require("mongoose");
const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.brands || mongoose.model("brand", brandSchema);
