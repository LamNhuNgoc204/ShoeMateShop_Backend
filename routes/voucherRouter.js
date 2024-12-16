const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const { protect, adminOrEmployee } = require("../middlewares/authMiddleware");

router.post(
  "/add",
  // protect, adminOrEmployee,
  voucherController.createVoucher
);
router.put(
  "/update/:id",
  protect,
  adminOrEmployee,
  voucherController.updateVoucher
);
router.put(
  "/delete/:id",
  protect,
  adminOrEmployee,
  voucherController.deleteVoucher
);

router.get("/list", protect, voucherController.getAllVouchers);
router.get(
  "/lst-voucher-for-web",
  protect,
  voucherController.getAllVouchersForWeb
);
router.get("/detail/:id", voucherController.getVoucherById);
router.get("/search", voucherController.searchVouchers);
router.post("/apply", protect, voucherController.applyVoucher);
module.exports = router;
