const express = require("express");
const router = express.Router();
const { managerMiddleware } = require("../middlewares/adminMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const statsController = require("../controllers/statsController");

// Routes for product statistics
router.get("/daily-stats", protect, managerMiddleware, statsController.getDailyStats);
router.get("/weekly-stats", protect, managerMiddleware, statsController.getWeeklyStats);
router.get("/monthly-stats", protect, managerMiddleware, statsController.getMonthlyStats);
router.get("/yearly-stats", protect, managerMiddleware, statsController.getYearlyStats);
router.get("/best-selling-products", protect, managerMiddleware, statsController.getBestSellingProducts);
router.get("/thongke", protect, managerMiddleware, statsController.getRevenueStats);

module.exports = router;
