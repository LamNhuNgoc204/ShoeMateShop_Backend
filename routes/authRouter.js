var express = require("express");
var router = express.Router();
var AuthController = require("../controllers/authController");

//methods:  PUT
//http:  http://localhost:8080/auth

router.put("/reset-password", AuthController.resetPassword);

// Forgot password
router.post("/forgot-password", AuthController.forgotPassword);

//verify password otp
router.post("/verify-password-otp", AuthController.verifyPasswordOTP);

//Save new password
router.put("/save-new-password", AuthController.saveNewPassword);

module.exports = router;
