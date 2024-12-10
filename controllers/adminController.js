const User = require("../models/userModel");
const { hashPassword } = require("../utils/encryptionUtils");
const { isValidPhoneNumber } = require("../utils/numberUtils");

exports.updateUserPermissions = async (req, res) => {
  try {
    const { newRole } = req.body;

    const user = req.user;

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        status: false,
        message:
          "Access denied. You don't have permission to perform this action.",
      });
    }

    user.role = newRole;
    await user.save();

    const infor = {
      email: user.email,
      phone: user.phoneNumber,
      name: user.name,
      role: user.role,
    };

    return res.status(200).json({
      status: true,
      message: "User role updated successfully.",
      data: infor,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.changePass = async (req, res) => {
  try {
    const { email, newPass } = req.body;

    if (!email || !newPass) {
      return res
        .status(400)
        .json({ status: false, mesage: "Fields are required" });
    }

    const userExits = await User.findOne({ email: email });
    if (!userExits) {
      return res.status(400).json({ status: false, mesage: "User not found!" });
    }

    const passUpdate = await hashPassword(newPass);
    userExits.password = passUpdate;
    await userExits.save();

    return res
      .status(200)
      .json({ status: true, message: "Update password success" });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.updateInfor = async (req, res) => {
  try {
    const user = req.user;
    const { avatar, name, phoneNumber } = req.body;

    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid phoneNumber" });
    }

    user.avatar = avatar ? avatar : user.avatar;
    user.name = name ? name : user.name;
    user.phoneNumber = phoneNumber ? phoneNumber : user.phoneNumber;

    const updatedUser = await user.save();
    if (!updatedUser) {
      return res.status(404).json({
        status: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "User profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
