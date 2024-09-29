const Address = require("../models/addressModel");
const User = require("../models/userModel");
const { isValidPhoneNumber } = require("../utils/numberUtils");

exports.addAddress = async (req, res) => {
  try {
    const { userId, address, recieverPhoneNumber, recieverName, isDefault } =
      req.body;

    // Check user existence
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "User does not exist!" });
    }

    //Check phoneNumber valid
    if (!isValidPhoneNumber(recieverPhoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    //Check if the address exists
    const existingAddress = await Address.findOne({
      userId: userId,
      address: address,
    });
    if (existingAddress) {
      return res
        .status(409)
        .json({ message: "This address already exists for this user" });
    }

    //If this address true, set orther address false
    if (isDefault) {
      await Address.updateMany(
        { userId: userId, isDefault: true },
        { isDefault: false }
      );
    }

    // Create new user address
    const newAddress = new Address({
      userId: userId,
      address: address,
      recieverPhoneNumber: recieverPhoneNumber,
      recieverName: recieverName,
      isDefault: isDefault || false,
    });
    await newAddress.save();

    return res.status(200).json({
      status: true,
      message: "Address added successfully",
      data: newAddress,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    const deletedAddress = await Address.findOneAndDelete({
      _id: addressId,
      userId: userId,
    });

    if (!deletedAddress) {
      return res
        .status(400)
        .json({ status: false, message: "Address not found" });
    }

    return res
      .status(200)
      .json({ status: true, message: "Address deleted successfully" });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const { address, recieverPhoneNumber, recieverName, isDefault } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const addressToUpdate = await Address.findOne({
      userId: userId,
      _id: addressId,
    });
    if (!addressToUpdate) {
      return res
        .status(404)
        .json({ status: false, message: "Address not found" });
    }

    addressToUpdate.address = address || addressToUpdate.address;
    addressToUpdate.recieverPhoneNumber =
      recieverPhoneNumber || addressToUpdate.recieverPhoneNumber;
    addressToUpdate.recieverName = recieverName || addressToUpdate.recieverName;
    addressToUpdate.isDefault = isDefault || addressToUpdate.isDefault;

    const updatedAddress = await addressToUpdate.save();

    if (!updatedAddress) {
      return res
        .status(404)
        .json({ status: false, message: "Address save failed" });
    }

    return res.status(200).json({
      status: true,
      message: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
