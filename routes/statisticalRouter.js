const express = require("express");
const router = express.Router();
const { managerMiddleware } = require("../middlewares/adminMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const statsController = require("../controllers/statsController"); // corrected typo

// Routes for product statistics
router.get("/daily-stats", protect, managerMiddleware, statsController.getDailyStats);
router.get("/weekly-stats", protect, managerMiddleware, statsController.getWeeklyStats);
router.get("/monthly-stats", protect, managerMiddleware, statsController.getMonthlyStats);
router.get("/yearly-stats", protect, managerMiddleware, statsController.getYearlyStats);
router.get("/best-selling-products", protect, managerMiddleware, statsController.getBestSellingProducts);

module.exports = router;
