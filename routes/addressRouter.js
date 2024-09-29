const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const {
  validateRequest,
  validateParams,
} = require("../middlewares/userMiddleware");

//http:  http://localhost:3000/addresses

// Add user's address
router.post("/add-address", validateRequest, addressController.addAddress);

// Delete user's address
router.delete(
  "/:userId/delete-address/:addressId",
  validateParams,
  addressController.deleteAddress
);

module.exports = router;
