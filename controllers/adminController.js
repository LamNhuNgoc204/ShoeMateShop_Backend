const User = require("../models/userModel");

exports.updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newRole } = req.body;

    const currentUser = req.user;

    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({
        status: false,
        message:
          "Access denied. You don't have permission to perform this action.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "User not found." });
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
