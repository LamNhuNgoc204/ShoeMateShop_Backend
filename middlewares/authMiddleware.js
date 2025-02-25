const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Middleware xác thực người dùng và token
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // if (!token) {
  //   return res
  //     .status(401)
  //     .json({ status: false, message: "Not authorized, no token" });
  // }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(400)
        .json({ status: false, message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log({ status: false, message: "Not authorized, token failed" });
    req.user = null;
    next();
  }
};

// Middleware kiểm tra quyền admin hoặc nhân viên
exports.adminOrEmployee = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "employee") {
    return res
      .status(403)
      .json({ message: "Access denied, admin or employee only" });
  }
  next();
};

exports.verifyToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access Denied. No token provided." });
    }

    console.log("Token: ", token);

    // Loại bỏ chuỗi "Bearer "
    // const actualToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    // Xác minh token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("verified ===> ", verified);

    req.user = verified;

    next();
  } catch (error) {
    console.log("Invalid token: ", error);

    return res.status(400).json({ message: "Invalid token." });
  }
};
