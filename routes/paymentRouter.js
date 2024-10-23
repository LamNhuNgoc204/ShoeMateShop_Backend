const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/paymentController");
//localhost:3000/payment

// ZALO PAY
router.post("/", PaymentController.Zalopayment);

router.post("/zalo/callback", PaymentController.notifycation);

router.post("order-status/:app_trans_id", PaymentController.orderStatus);

// MOMO
router.post("/momo", PaymentController.paymnetMomo);

router.post("/momo/callback", PaymentController.callback);

router.post("/momo/order-status", PaymentController.momoOrderStatus);

// THEM PAYMENT METHOD
router.post("/add-payment-method", PaymentController.createNewMethod);

router.get("/getall-payment", PaymentController.getAllPaymentMethod);

// THANH TOÁn ONLINE DO SHOP TỰ ĐI THU :)

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
