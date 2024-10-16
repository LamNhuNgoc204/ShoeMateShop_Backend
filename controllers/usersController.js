const User = require("../models/userModel");

exports.getUserInfo = async (req, res) => {
  try {
    const user = req.user;

    const information = {
      email: user.email,
      phone: user.phoneNumber,
      name: user.name,
      role: user.role,
      device_info: user.device_info,
      wallet: user.wallet,
      address: user.address,
      search: user.search,
      cart: user.cart,
      wishlist: user.wishlist,
    };

    return res.status(200).json({
      status: true,
      message: "User information retrieved successfully.",
      data: information,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const { name, avatar, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "User does not exist!" });
    }
    if (name) {
      user.name = name;
    }
    if (avatar) {
      user.avatar = avatar;
    }
    const updatedUser = await user.save();
    const userData = updatedUser.toObject();
    delete userData.password;
    return res.status(200).json({
      status: true,
      message: "User profile updated successfully.",
      data: userData,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["admin", "user", "employee"].includes(role)) {
      return res.status(404).json({ status: false, message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) {
      return res.status(402).json({ status: false, message: "User not found" });
    }

    return res
      .status(200)
      .json({ status: true, message: "update role success", data: user });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error });
  }
};

exports.getAllUser = async (_, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } });

    return res
      .status(200)
      .json({ status: true, message: "Get all users success", data: users });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
