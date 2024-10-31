const express = require("express");
const router = express.Router();
const { managerMiddleware } = require("../middlewares/adminMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const statsController = require("../controllers/statsController"); // corrected typo

// Routes for product statistics
router.get("/", statsController.getStats);
router.get("/best-selling-products", protect, managerMiddleware, statsController.getBestSellingProducts);
router.get("/products", protect, managerMiddleware, statsController.getRevenueByProduct);

module.exports = router;
