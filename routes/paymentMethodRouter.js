const express = require("express");
const control = require("../controllers/paymentController");
const router = express.Router();

// url: /payment-method

// THEM PAYMENT METHOD
router.post("/add-payment-method", control.createNewMethod);

router.get("/getall-payment", control.getAllPaymentMethod);

module.exports = router;
