const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const control = require("../controllers/walletController");

// http://localhost:3000/wallet

router.post("/register-wallet", protect, control.registerWallet);

router.post("/authenticate-wallet", protect, control.authenticateWallet);

router.post("/deposit", protect, control.deposit);

module.exports = router;
