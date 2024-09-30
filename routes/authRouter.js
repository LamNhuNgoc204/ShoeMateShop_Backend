var express = require("express");
var router = express.Router();
var AuthController = require("../controllers/authController");
const { validateRequest,validateRegister,validateLogin, validateUpdatePassword, validateSignInWithGoogle } = require("../middlewares/userMiddleware");

//methods:  PUT
//http:  http://localhost:3000/auth
// Verify email
router.post("/verify-email", AuthController.verifyOTP);
// Signup route
router.post("/signup",validateRegister, AuthController.signup);

// Login route
router.post("/login",validateLogin, AuthController.login);

router.put("/reset-password", validateUpdatePassword ,AuthController.resetPassword);

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


//login/signup with gg
router.post("/login-with-google", validateSignInWithGoogle, AuthController.signInWithGG)





module.exports = router;
