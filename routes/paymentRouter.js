const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/paymentController");
//localhost:3000/payment

router.post("/", PaymentController.paymentFunction);

router.post("/callback", PaymentController.notifycation);

router.post("order-status/:app_trans_id", PaymentController.orderStatus);

// THEM PAYMENT METHOD
router.post('/add-payment-method', PaymentController.createNewMethod)

router.get('/getall-payment', PaymentController.getAllPaymentMethod)




















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
