var express = require("express");
var router = express.Router();
const adminController = require("../controllers/adminController");
const { checkPermission } = require("../middlewares/permissions");
const { validateRequest } = require("../middlewares/userMiddleware");

// url: http://localhost:8080/admins

// update role
router.put(
  "/update-permission/:userId",
  checkPermission(["admin"]),
  validateRequest,
  adminController.updateUserPermissions
);

module.exports = router;
