const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const { validateRequest } = require("../middlewares/userMiddleware");

//http:  http://localhost:3000/addresses

// Add user's address
router.post("/add-address", validateRequest, addressController.addAddress);

module.exports = router;
