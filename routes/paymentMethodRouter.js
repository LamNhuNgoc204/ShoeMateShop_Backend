const express = require("express");
const control = require("../controllers/paymentController");
const { protect, adminOrEmployee } = require("../middlewares/authMiddleware");
const router = express.Router();

// url: /payment-method

// THEM PAYMENT METHOD
router.post(
  "/add-payment-method",
  protect,
  adminOrEmployee,
  control.createNewMethod
);

router.put("/update-payment/:id", protect, control.updatePaymentMethod);
router.put("/update-payment-status/:id", protect, control.updatePaymentStatus);

router.get("/getall-payment", protect, control.getAllPaymentMethod);
router.get("/lst-payment", protect, control.getPaymentMethodForWeb);

router.get("/payment-default", protect, control.getPaymentDefault);

module.exports = router;
