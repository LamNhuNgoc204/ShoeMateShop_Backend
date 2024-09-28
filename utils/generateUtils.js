// Generate functions
const crypto = require("crypto");

exports.generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Token
exports.generateJWT_SECRET = () => {
  return crypto.randomBytes(64).toString("hex");
};
