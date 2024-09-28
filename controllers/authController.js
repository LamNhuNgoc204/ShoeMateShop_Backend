const User = require("../models/userModel");
const { checkPassword, hashPassword } = require("../utils/encryptionUtils");
const { sendEmail } = require("../utils/emailUtils");
const { generateOTP } = require("../utils/generateUtils");

exports.resetPassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    // Validate user input
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({
        status: false,
        message: "Please provide all required fields.",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "User not found." });
    }

    // Check if old password is correct
    const isPasswordCorrect = await checkPassword(oldPassword, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ status: false, message: "Old password is incorrect." });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    const newUser = user.toObject();
    delete newUser.password;

    return res.json(200).status({
      status: true,
      message: "New password had been changed successfully!",
      data: newUser,
    });
  } catch (error) {
    console.log("reset password err: ", error);
    return res.status(500).json({ status: false, message: "server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { userId, email } = req.body;

    // Check email existence
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "User does not exist!" });
    }

    const otp = generateOTP();

    //Save to db
    user.passwordOTP = otp;
    user.passwordOTPExpire = Date.now() + 120 * 1000;
    await user.save();

    //Send email to change password
    const message = `Your otp code is: ${otp}`;
    await sendEmail(email, "OTP code reset password", message);

    return res.status(200).json({
      status: true,
      message: "An email has been sent to reset your password.",
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.verifyPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check email existence
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "User does not exist!" });
    }

    //Check otp
    if (user.passwordOTP !== otp || Date.now() > user.passwordOTPExpire) {
      return res
        .status(400)
        .json({ status: false, message: "Otp is invalid or expired!" });
    }

    return res.status(200).json({
      status: true,
      message: "Valid otp code.",
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.saveNewPassword = async (req, res) => {
  try {
    const { email, newPassword, re_newPassword } = req.body;

    // Check email existence
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "User does not exist!" });
    }

    if (newPassword !== re_newPassword) {
      return res
        .status(400)
        .json({ status: false, message: "Passwords do not match!" });
    }

    user.password = hashPassword(newPassword);
    user.passwordOTP = undefined;
    user.passwordOTPExpire = undefined;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
