exports.validateRequest = (req, res, next) => {
  const { userId, email, newPassword, re_newPassword } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ status: false, message: "User ID is required!" });
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

  if (newPassword.length < 6) {
    return res.status(400).json({
      status: false,
      message: "Password must be at least 6 characters long!",
    });
  }

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

  next();
};
