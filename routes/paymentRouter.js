const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/paymentController");
//localhost:3000/payment

//Confirm successful payment
router.post("/confirm-payment", PaymentController.confirmPayment);

//Process refund
router.post("/refund", PaymentController.processRefund);

//Save payment information
router.post("/save", PaymentController.savePaymentInfo);

//Get payment information by order_id
router.get("/:payment_id?", PaymentController.getPayments);

//Update payment status for an existing order
router.post("/update-status", PaymentController.updatePaymentStatus);

//Get payments by status
router.post("/by-status", PaymentController.getPaymentsByStatus);

//Cancel payment and update order
router.post("/cancel", PaymentController.cancelPayment);

module.exports = router;
