const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const {
  checkFieldsAddress,
  checkAddressId,
} = require("../middlewares/userMiddleware");
const { protect } = require("../middlewares/authMiddleware");

//http:  http://localhost:3000/addresses

// Add user's address
router.post(
  "/add-address",
  protect,
  checkFieldsAddress,
  addressController.addAddress
);

// Delete user's address
router.delete(
  "/delete-address/:addressId",
  protect,
  checkAddressId,
  addressController.deleteAddress
);

// Update user's address
router.put(
  "/update-address/:addressId",
  protect,
  checkAddressId,
  checkFieldsAddress,
  addressController.updateAddress
);

// Get all user's addresses
router.get("/get-all-address", protect, addressController.getAllAddresses);

// Set address default
router.put(
  "/set-default-address/:addressId",
  protect,
  checkAddressId,
  addressController.setAddressDefault
);

// Get address Default
router.get("/default-address", protect, addressController.getDefaultAddress);

module.exports = router;
