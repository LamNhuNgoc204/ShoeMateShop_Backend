const express = require("express");
const router = express.Router();
const { managerMiddleware } = require("../middlewares/adminMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const statsController = require("../controllers/statsController"); // corrected typo

// Routes for product statistics
router.get("/total-revenue", statsController.getStats);
router.get("/products", protect, managerMiddleware, statsController.getRevenueByProduct);
router.get("/", protect, managerMiddleware, statsController.getRevenueStats);
router.get("/low-stock", protect, managerMiddleware, statsController.LowStock);
router.get("/best-selling-products", protect, managerMiddleware, statsController.getBestSellingProducts);
router.get("/get-registration", protect, managerMiddleware, statsController.getRegistrationStats);



module.exports = router;
