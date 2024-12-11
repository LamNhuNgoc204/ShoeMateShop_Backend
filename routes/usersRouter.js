var express = require("express");
var router = express.Router();
const userController = require("../controllers/usersController");
const { protect } = require("../middlewares/authMiddleware");
const {
  managerMiddleware,
  adminMiddleware,
} = require("../middlewares/adminMiddleware");

// url: http://localhost:3000/users

// Get user information
router.get("/user-infor", protect, userController.getUserInfo);

//update user profile
router.put("/update-user-profile", protect, userController.updateUserProfile);

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

router.post('/refresh-fcm', protect, userController.refreshFcmToken)
router.put("/lock-accound/:userId", protect, userController.LockAccount);
router.put("/add-search", protect, userController.addSearch)
router.put('/remove-search', protect, userController.removeSearch)
router.get('/get-searchs', protect, userController.getSearchHistories)

module.exports = router;
