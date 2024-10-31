const express = require("express");
const {
  addRecentView,
  getRecentViews,
} = require("../controllers/recentViewProductController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

// /recent-views

router.post("/:productId", protect, addRecentView);

router.get("/get-recent-views", protect, getRecentViews);

module.exports = router;
