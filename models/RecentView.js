const mongoose = require("mongoose");

const recentViewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      viewedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports =
  mongoose.models.recentviews || mongoose.model("recentview", recentViewSchema);
