const User = require("../models/userModel");
const { checkPassword, hashPassword } = require("../utils/encryptionUtils");
const { generateOTP } = require("../utils/generateUtils");
const { createToken, verifyToken } = require("../utils/token");
const {
  sendVerificationEmail,
  sendRandomPassword,
} = require("../utils/emailUtils");
const { randomPassword } = require("../utils/stringUtils");
const { sendNotification } = require("../firebase");

// Quên mật khẩu
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Vui lòng cung cấp địa chỉ email.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "Người dùng không tồn tại." });
    }
    if (!user.isVerified) {
      return res.status(400).json({
        status: false,
        message: "Người dùng chưa xác thực email. Vui lòng xác thực trước.",
      });
    }
    const newOtpCode = generateOTP();
    user.otpCode = newOtpCode;
    user.otpExpires = Date.now() + 10 * 60 * 1000; 
    await user.save();
    await sendVerificationEmail(email, newOtpCode);
    return res.status(200).json({
      status: true,
      message: "OTP đã được gửi tới email của bạn!",
    });
  } catch (error) {
    console.log("Forgot Password error: ", error);
    return res.status(500).json({ status: false, message: "Lỗi server" });
  }
};

// Xác thực OTP Forgot Password
exports.verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "Người dùng không tồn tại." });
    }

    if (user.otpCode !== otpCode || Date.now() > user.otpExpires) {
      return res
        .status(400)
        .json({ status: false, message: "OTP không hợp lệ hoặc đã hết hạn." });
    }

    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "OTP xác thực thành công! Bạn có thể đặt lại mật khẩu.",
    });
  } catch (error) {
    console.log("Verify Forgot Password OTP error: ", error);
    return res.status(500).json({ status: false, message: "Lỗi server" });
  }
};

// Đổi password sau khi xác thức OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ status: false, message: "Email và mật khẩu mới là bắt buộc." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "Người dùng không tồn tại." });
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Mật khẩu đã được đặt lại thành công.",
    });
  } catch (error) {
    console.log("Reset Password error: ", error);
    return res.status(500).json({ status: false, message: "Lỗi server." });
  }
};

// Resend OTP Forgot Password
exports.resendForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Please provide an email address.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "User not found." });
    }


    // Generate a new OTP code and expiry
    const newOtpCode = generateOTP();
    user.otpCode = newOtpCode;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await user.save();

    // Send OTP to user's email
    await sendVerificationEmail(email, newOtpCode);

    return res.status(200).json({
      status: true,
      message: "OTP for password reset has been resent successfully!",
    });
  } catch (error) {
    console.log("Resend Forgot Password OTP error: ", error);
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

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: "Email đã tồn tại" });
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

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Please provide an email address.",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "User not found." });
    }
    if (user.isVerified) {
      return res
        .status(400)
        .json({ status: false, message: "User is already verified." });
    }
    const newOtpCode = generateOTP();
    user.otpCode = newOtpCode;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    await sendVerificationEmail(email, newOtpCode);
    return res.status(200).json({
      status: true,
      message: "OTP has been resent successfully!",
    });
  } catch (error) {
    console.log("Resend OTP error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "User not found." });
    }

    if (user.otpCode !== otpCode || Date.now() > user.otpExpires) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = createToken(user._id);

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json({
      status: true,
      message: "Email verified successfully!",
      data: { user: userResponse, token },
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

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
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

exports.refreshToken = async (req, res) => {
  try {
    const { token, userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: false, message: "User not found!" });
    }

    if (!token)
      return res.status(403).json({ message: "Refresh token is required" });

    let newToken = "";
    const checkToken = verifyToken(token);
    if (!checkToken.valid) {
      newToken = createToken(userId);
    }

    return res.status(200).json({
      status: true,
      data: newToken,
    });
  } catch (error) {
    console.log("refreshToken error: ", error);
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
    const token = createToken(userData._id);

    return res.status(200).json({ status: true, data: userData, token: token });
  } catch (error) {
    console.log("Google sign-in error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getProtectedData = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      message: "Verify success",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
