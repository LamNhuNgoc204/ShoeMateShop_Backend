var express = require("express");
var router = express.Router();
const userController = require("../controllers/usersController");
const {
  validateUpdateProfile,
  checkUserId,
} = require("../middlewares/userMiddleware");

// url: http://localhost:8080/users

// Get user information
router.get("/user-infor/:userId", checkUserId, userController.getUserInfo);

//update user profile
router.put(
  "/update-user-profile",
  validateUpdateProfile,
  userController.updateUserProfile
);

module.exports = router;
