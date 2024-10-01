exports.adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(400).json({ message: "Access denied. Admin only." });
  }
};

exports.managerMiddleware = (req, res, next) => {
  if ((req.user && req.user.role === "admin") || req.user.role === "employee") {
    next();
  } else {
    return res
      .status(400)
      .json({ message: "Access denied. Admin and employee only." });
  }
};
