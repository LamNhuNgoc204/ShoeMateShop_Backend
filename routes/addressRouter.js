const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const {
  checkUserId,
  checkFieldsAddress,
  checkUserAddressId,
} = require("../middlewares/userMiddleware");

//http:  http://localhost:3000/addresses

// Add user's address
router.post(
  "/:userId/add-address",
  checkUserId,
  checkFieldsAddress,
  addressController.addAddress
);

// Delete user's address
router.delete(
  "/:userId/delete-address/:addressId",
  checkUserAddressId,
  addressController.deleteAddress
);

// Update user's address
router.put(
  "/:userId/update-address/:addressId",
  checkUserAddressId,
  checkFieldsAddress,
  addressController.updateAddress
);

// Get all user's addresses
router.get(
  "/get-all-address/:userId",
  checkUserId,
  addressController.getAllAddresses
);

// Set address default
router.put(
  "/:userId/set-default-address/:addressId",
  checkUserAddressId,
  addressController.setAddressDefault
);

// Get address Default
router.get(
  "/:userId/default-address",
  checkUserId,
  addressController.getDefaultAddress
);

module.exports = router;
