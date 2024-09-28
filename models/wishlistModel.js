const mongoose = require("mongoose");
const wishlistSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
  createAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.wishlists || mongoose.model("wishlist", wishlistSchema);
