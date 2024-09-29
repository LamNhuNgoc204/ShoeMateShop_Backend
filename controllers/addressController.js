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

    // Create new user address
    const newAddress = new Address({
      userId: userId,
      address: address,
      recieverPhoneNumber: recieverPhoneNumber,
      recieverName: recieverName,
      isDefault: isDefault,
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
