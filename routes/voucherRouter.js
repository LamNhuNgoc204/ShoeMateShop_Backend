const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const { protect, adminOrEmployee } = require("../middlewares/authMiddleware");

// Tạo voucher mới (Chỉ admin hoặc nhân viên) - Route: /add
router.post(
  "/add",
  // protect, adminOrEmployee,
  voucherController.createVoucher
);

// Cập nhật voucher theo ID (Chỉ admin hoặc nhân viên) - Route: /update/:id
router.put(
  "/update/:id",
  protect,
  adminOrEmployee,
  voucherController.updateVoucher
);

// Xóa voucher theo ID (Chỉ admin hoặc nhân viên) - Route: /delete/:id
router.delete(
  "/delete/:id",
  protect,
  adminOrEmployee,
  voucherController.deleteVoucher
);

// Lấy danh sách tất cả voucher (Ai cũng có thể truy cập) - Route: /list
router.get("/list", protect, voucherController.getAllVouchers);

// Lấy voucher theo ID (Ai cũng có thể truy cập) - Route: /detail/:id
router.get("/detail/:id", voucherController.getVoucherById);

// Tìm kiếm voucher theo tên hoặc mã (Ai cũng có thể truy cập) - Route: /search
router.get("/search", voucherController.searchVouchers);

// Áp dụng voucher vào đơn hàng - Route: /apply
router.post("/apply", protect, voucherController.applyVoucher);

module.exports = router;
