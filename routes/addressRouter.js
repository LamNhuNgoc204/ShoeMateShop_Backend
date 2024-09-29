const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const {
  validateRequest,
  validateParams,
  validateFields,
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

// Update user's address
router.put(
  "/:userId/update-address/:addressId",
  validateParams,
  validateFields,
  addressController.updateAddress
);

// Get all user's addresses
router.get(
  "/get-all-address/:userId",
  validateParams,
  addressController.getAllAddresses
);

// Set address default
router.put(
  "/:userId/set-default-address/:addressId",
  validateParams,
  addressController.setAddressDefault
);

module.exports = router;
