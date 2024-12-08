const express = require("express");
const router = express.Router();
const control = require("../controllers/walletController");
const { protect, adminOrEmployee } = require("../middlewares/authMiddleware");
 // http://localhost:3000/wallet
// API Kích hoạt ví
router.post("/activate",protect, control.activateWallet);

router.post("/deposit",protect, control.depositWithZaloPay); // API nạp tiền
router.post("/callback", control.handleZaloPayCallback); 

router.post("/update-balance",protect, control.updateBalance);

// API Chuyển tiền
router.post("/transfer",protect, control.transferMoney);

// API Thanh toán
router.post("/payment",protect, control.makePayment);

// API Lấy số dư
router.get("/balance",protect, control.getBalance);

// API Lấy lịch sử giao dịch
router.get("/transactions",protect, control.getTransactions);

 //API lấy tên người dùng theo email
router.get("/user-name/:email", control.getUserNameByEmail);

module.exports = router;
