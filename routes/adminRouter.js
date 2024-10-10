var express = require("express");
var router = express.Router();
const adminController = require("../controllers/adminController");
const {
  checkUserPermission,
  checkUserId,
} = require("../middlewares/userMiddleware");
const { protect } = require("../middlewares/authMiddleware");

// url: http://localhost:3000/admins

// update role
router.put(
  "/update-permission",
  protect,
  checkUserPermission,
  adminController.updateUserPermissions
);

module.exports = router;
