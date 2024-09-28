var express = require("express");
var router = express.Router();
var AuthController = require("../controllers/authController");
const { validateRequest } = require("../middlewares/userMiddleware");

//methods:  PUT
//http:  http://localhost:8080/auth

router.put("/reset-password", AuthController.resetPassword);

// Forgot password
router.post("/forgot-password", validateRequest, AuthController.forgotPassword);

//verify password otp
router.post(
  "/verify-password-otp",
  validateRequest,
  AuthController.verifyPasswordOTP
);

//Save new password
router.put(
  "/save-new-password",
  validateRequest,
  AuthController.saveNewPassword
);

module.exports = router;
