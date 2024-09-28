const mongoose = require("mongoose");
const assetSchema = new mongoose.Schema({
  assetUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.assets || mongoose.model("asset", assetSchema);
