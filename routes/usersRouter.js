var express = require("express");
var router = express.Router();
const userController = require("../controllers/usersController");
const { validateUpdateProfile } = require("../middlewares/userMiddleware");
const { protect } = require("../middlewares/authMiddleware");

// url: http://localhost:8080/users

// Get user information
router.get("/user-infor", protect, userController.getUserInfo);

//update user profile
router.put(
  "/update-user-profile",
  validateUpdateProfile,
  userController.updateUserProfile
);

module.exports = router;
