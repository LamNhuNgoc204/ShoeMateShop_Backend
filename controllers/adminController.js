const User = require("../models/userModel");
const { hashPassword } = require("../utils/encryptionUtils");

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
      device_info: user.device_info,
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
