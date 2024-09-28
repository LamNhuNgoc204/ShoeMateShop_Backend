exports.checkPermission = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.user.role;

    if (userRole !== requiredRole) {
      return res.status(400).json({
        status: false,
        message:
          "Access denied. You don't have permission to perform this action.",
      });
    }

    next();
  };
};
