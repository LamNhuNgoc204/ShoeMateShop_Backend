var express = require("express");
var router = express.Router();
const userController = require("../controllers/usersController");
const { validateRequest } = require("../middlewares/userMiddleware");

// url: http://localhost:8080/users

// Get user information
router.get("/user-infor/:userId", validateRequest, userController.getUserInfo);

module.exports = router;
