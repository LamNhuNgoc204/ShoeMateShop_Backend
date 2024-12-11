var express = require("express");
var router = express.Router();
var AuthController = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
  validateUpdatePassword,
  validateSignInWithGoogle,
  checkUser,
  verifyOTP,
  saveNewPassword,
} = require("../middlewares/userMiddleware");
const { verifyToken, protect } = require("../middlewares/authMiddleware");

//methods:  PUT
//http:  http://localhost:3000/auth

//Verify token
router.post("/protected", verifyToken, AuthController.getProtectedData);

// Verify email
router.post("/verify-email", AuthController.verifyOTP);
//resend otp
router.post("/resend-otp", AuthController.resendOTP);
// Signup route
router.post("/signup", validateRegister, AuthController.signup);

// Login route
// http://localhost:3000/auth/login
router.post("/login", validateLogin, AuthController.login);

router.put(
  "/reset-password",
  validateUpdatePassword,
  AuthController.resetPassword
);

// Forgot password
router.post("/forgot-password", checkUser, AuthController.forgotPassword);

//verify password otp
router.post(
  "/verify-password-otp",
  checkUser,
  verifyOTP,
  AuthController.verifyPasswordOTP
);

//Save new password
router.put(
  "/save-new-password",
  checkUser,
  saveNewPassword,
  AuthController.saveNewPassword
);

//login/signup with gg
router.post(
  "/login-with-google",
  validateSignInWithGoogle,
  AuthController.signInWithGG
);

// Forgot password
router.post("/forgot-password", checkUser, AuthController.forgotPassword);

// Verify OTP for forgot password
router.post(
  "/verify-password-otp-forgot-password",
  checkUser,
  AuthController.verifyForgotPasswordOTP
);
// Reset password after OTP verification
router.put(
  "/reset-password-forgot-password",
  AuthController.resetPassword
);
// Resend OTP for forgot password
router.post(
  "/resend-forgot-password-otp",
  checkUser, // Middleware kiểm tra email hợp lệ
  AuthController.resendForgotPasswordOTP
);

router.post("/refresh-token", AuthController.refreshToken);

module.exports = router;
