const express = require("express");
const router = express.Router();
const advertisingController = require("../controllers/advertisingController");
const { protect, adminOrEmployee } = require("../middlewares/authMiddleware");

// Tạo quảng cáo mới (Chỉ admin hoặc nhân viên)
router.post("/create", protect, adminOrEmployee, advertisingController.createAd);

// Cập nhật quảng cáo (Chỉ admin hoặc nhân viên)
router.put("/update/:id", protect, adminOrEmployee, advertisingController.updateAd);

// Lấy danh sách tất cả các quảng cáo và lọc
router.get("/all", protect, advertisingController.getAllAds);
// Tăng lượt xem quảng cáo
router.put("/views/:id", protect, advertisingController.incrementAdViews);

// Xóa quảng cáo (Chỉ admin hoặc nhân viên)
router.delete("/delete/:id", protect, adminOrEmployee, advertisingController.deleteAd);

// Lấy quảng cáo theo ID
router.get("/detail/:id", protect, advertisingController.getAdById);

// Lấy quảng cáo theo loại (category)
router.get("/category/:category", protect, advertisingController.getAdsByCategory);

// Tăng lượt click quảng cáo
router.put("/clicks/:id",protect, advertisingController.incrementAdClicks);
module.exports = router;