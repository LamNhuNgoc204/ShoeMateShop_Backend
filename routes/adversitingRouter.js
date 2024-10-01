const express = require("express");
const router = express.Router();
const adversitingController = require("../controllers/advertisingController");
const { protect, adminOrEmployee } = require("../middlewares/authMiddleware");

// Tạo quảng cáo mới (Chỉ admin hoặc nhân viên)
router.post("/create", protect, adminOrEmployee, adversitingController.createAd);

// Cập nhật quảng cáo (Chỉ admin hoặc nhân viên)
router.put("/update/:id", protect, adminOrEmployee, adversitingController.updateAd);

// Lấy danh sách tất cả các quảng cáo và lọc
router.get("/all", protect, adversitingController.getAllAds);

module.exports = router;