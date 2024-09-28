var express = require("express");
var router = express.Router();
const userController = require("../controllers/usersController");

// url: http://localhost:8080/users

// Get user information
router.get("/user-infor/:userId", userController.getUserInfo);

module.exports = router;
