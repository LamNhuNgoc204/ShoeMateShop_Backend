const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(400).json({ message: "Access denied. Admin only." });
  }
};

module.exports = adminMiddleware;
