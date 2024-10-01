const { isValidPhoneNumber } = require("../utils/numberUtils");
const {
  validateEmail,
  checkRole,
  validatePassword,
} = require("../utils/stringUtils");
const User = require("../models/userModel");

exports.validateRegister = (req, res, next) => {
  const { email, password, name } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ status: false, message: "Name is required!" });
  }

  if (!email) {
    return res
      .status(400)
      .json({ status: false, message: "Email is required!" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid email format!" });
  }

  if (!password) {
    return res.status(400).json({
      status: false,
      message: "Password are required!",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      status: false,
      message: "Password must be at least 6 characters long!",
    });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ status: false, message: "Email is required!" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid email format!" });
  }

  if (!password) {
    return res.status(400).json({
      status: false,
      message: "Password is required!",
    });
  }

  next();
};

exports.validateUpdatePassword = async (req, res, next) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    // Validate user input
    if (!userId) {
      return res.status(400).json({
        status: false,
        message: "User ID is required.",
      });
    }
    if (!oldPassword) {
      return res.status(400).json({
        status: false,
        message: "Old password is required.",
      });
    }
    if (!newPassword) {
      return res.status(400).json({
        status: false,
        message: "New password is required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 6 characters long.",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

exports.validateSignInWithGoogle = async (req, res, next) => {
  try {
    const { email, name, avatar } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Email is required!" });
    }
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid email format!" });
    }
    if (!name) {
      return res
        .status(400)
        .json({ status: false, message: "Name is required!" });
    }
    if (!avatar) {
      return res
        .status(400)
        .json({ status: false, message: "Avatar is required!" });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

exports.validateUpdateProfile = async (req, res, next) => {
  try {
    const { name, avatar, userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ status: false, message: "User ID is required!" });
    }
    if (!name && !avatar) {
      return res.status(400).json({
        status: false,
        message: "At least one of name or avatar is required!",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

exports.checkUserId = (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      status: false,
      message: "User Id is required!",
    });
  }

  next();
};

exports.checkUserAddressId = (req, res, next) => {
  const { userId, addressId } = req.params;

  if (!userId) {
    return res.status(400).json({
      status: false,
      message: "User Id is required!",
    });
  }

  if (!addressId) {
    return res.status(400).json({
      status: false,
      message: "addressId is required!",
    });
  }
  next();
};

exports.checkFieldsAddress = (req, res, next) => {
  const data = req.body;

  if (!data.address) {
    return res
      .status(400)
      .json({ status: false, message: "Address is required!" });
  }

  if (!data.recieverPhoneNumber) {
    return res
      .status(400)
      .json({ status: false, message: "Receiver phone number is required!" });
  }

  if (!isValidPhoneNumber(data.recieverPhoneNumber)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid phone number format!" });
  }

  if (!data.recieverName) {
    return res
      .status(400)
      .json({ status: false, message: "Receiver name is required!" });
  }

  if (data.isDefault !== undefined && typeof data.isDefault !== "boolean") {
    return res
      .status(400)
      .json({ status: false, message: "isDefault must be a boolean!" });
  }

  next();
};

exports.checkUserPermission = (req, res, next) => {
  const { newRole } = req.body;

  if (!newRole) {
    return res
      .status(400)
      .json({ status: false, message: "New role is required!" });
  }

  if (!checkRole(newRole)) {
    return res.status(400).json({ status: false, message: "Invalid role." });
  }

  next();
};

exports.checkUser = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ status: false, message: "Email is required!" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(400)
      .json({ status: false, message: "User does not exist!" });
  }

  req.user = user;
  next();
};

exports.verifyOTP = async (req, res, next) => {
  const { otp } = req.body;
  const user = req.user;

  if (user.passwordOTP !== otp || Date.now() > user.passwordOTPExpire) {
    return res
      .status(400)
      .json({ status: false, message: "Otp is invalid or expired!" });
  }

  next();
};

exports.saveNewPassword = async (req, res, next) => {
  const { newPassword, re_newPassword } = req.body;

  if (!newPassword || !re_newPassword) {
    return res.status(400).json({
      status: false,
      message: "New password and re-entered password are required!",
    });
  }

  if (newPassword !== re_newPassword) {
    return res
      .status(400)
      .json({ status: false, message: "Passwords do not match!" });
  }

  if (!validatePassword(newPassword)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid password!" });
  }

  next();
};

exports.addNewEmployee = async (req, res, next) => {
  const { email, phoneNumber, name, password, role } = req.body;

  const user = await User.findOne({ email: email });
  if (user) {
    return res.status(400).json({
      status: false,
      message: "Email has been used",
    });
  }

  if (!email || !phoneNumber || !name || !password || !role) {
    return res.status(400).json({
      status: false,
      message: "Do not leave the form blank",
    });
  }

  if (!validateEmail(email)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid email format!" });
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid phone number format!" });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ status: false, message: "Weak password!" });
  }

  if (!checkRole(role)) {
    return res.status(400).json({ status: false, message: "Invalid role!" });
  }

  next();
};
