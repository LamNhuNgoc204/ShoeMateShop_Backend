const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { createReview } = require("../middlewares/reviewMiddleware");
const { protect } = require("../middlewares/authMiddleware");

// url: http://localhost:3000/reviews

// Create Review
router.post("/create-review",protect, createReview, reviewController.createReview);

module.exports = router;
