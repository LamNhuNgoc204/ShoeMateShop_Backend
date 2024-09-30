const User = require("../models/userModel");
const { checkPassword, hashPassword } = require("../utils/encryptionUtils");
const { sendEmail } = require("../utils/emailUtils");
const { generateOTP } = require("../utils/generateUtils");
const { createToken } = require("../utils/token");
const {
  sendVerificationEmail,
  sendRandomPassword,
} = require("../utils/emailUtils");
const { randomPassword } = require("../utils/stringUtils");

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

    return res.status(200).json({
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
    const { email } = req.body;

    // get user in middleware
    const user = req.user;

    const otp = generateOTP();

    //Save to db
    user.passwordOTP = otp;
    user.passwordOTPExpire = Date.now() + 120 * 1000;
    await user.save();

    await sendVerificationEmail(email, otp);

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
    const { newPassword } = req.body;

    // get user in middleware
    const user = req.user;

    user.password = await hashPassword(newPassword);
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

//signup
exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    // Validate user input
    if (!email || !password || !name) {
      return res.status(400).json({
        status: false,
        message: "Please provide all required fields.",
      });
    }
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: "Email already in use." });
    }
    const hashedPassword = await hashPassword(password);
    const otpCode = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      otpCode,
      otpExpires,
      isVerified: false,
    });

    await newUser.save();
    await sendVerificationEmail(email, otpCode);

    return res.status(201).json({
      status: true,
      data: {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        isVerified: newUser.isVerified,
      },
      message: "User registered successfully! Please verify your email.",
    });
  } catch (error) {
    console.log("Signup error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    // Kiểm tra người dùng
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "User not found." });
    }

    if (user.otpCode !== otpCode || Date.now() > user.otpExpires) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired OTP.",
      });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Email verified successfully!",
    });
  } catch (error) {
    console.log("Verify OTP error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
// login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate user input
    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Please provide both email and password.",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "User does not exist." });
    }

    // Check if password is correct
    const isPasswordCorrect = await checkPassword(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid password." });
    }

    // Generate JWT token
    const token = createToken(user._id);

    // Return user info without password
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      status: true,
      message: "Login successful!",
      data: { user: userResponse, token },
    });
  } catch (error) {
    console.log("Login error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.signInWithGG = async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    // Kiểm tra người dùng
    var user = await User.findOne({ email });
    if (!user) {
      const password = randomPassword();
      const hashedPassword = await hashPassword(password);
      user = await User.create({
        email,
        password: hashedPassword,
        name,
        isVerified: true,
        avatar: avatar,
        phoneNumber: 1,
      });
      await sendRandomPassword(email, password, name);
    }

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({ status: true, data: userData });
  } catch (error) {
    console.log("Google sign-in error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
