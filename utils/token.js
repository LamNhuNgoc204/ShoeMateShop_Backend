const jwt = require("jsonwebtoken");
const { generateJWT_SECRET } = require("./generateUtils");

const JWT_SECRET = generateJWT_SECRET();

//Create token
exports.createToken = (userId) => {
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });
  return token;
};

//Verify token
exports.verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, message: "Tokens expire" };
  }
};
