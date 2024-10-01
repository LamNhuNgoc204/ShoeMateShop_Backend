const express = require("express");
const router = express.Router();
const adversitingController = require("../controllers/advertisingController");
const { protect, adminOrEmployee } = require("../middlewares/authMiddleware");

// Tạo quảng cáo mới (Chỉ admin hoặc nhân viên)
router.post("/create", protect, adminOrEmployee, adversitingController.createAd);


module.exports = router;