var express = require("express");
var router = express.Router();
const userController = require("../controllers/usersController");
const {
  validateUpdateProfile,
  checkUser,
} = require("../middlewares/userMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const {
  managerMiddleware,
  adminMiddleware,
} = require("../middlewares/adminMiddleware");

// url: http://localhost:3000/users

// Get user information
router.get("/user-infor", protect, userController.getUserInfo);

//update user profile
router.put(
  "/update-user-profile",
  validateUpdateProfile,
  userController.updateUserProfile
);

router.put(
  "/update-role/:userId",
  protect,
  adminMiddleware,
  userController.updateRole
);

router.get(
  "/get-all-user",
  protect,
  managerMiddleware,
  userController.getAllUser
);

router.post(
  "/add-new-user",
  protect,
  adminMiddleware,
  userController.adddNewUser
);

module.exports = router;
