exports.validateRequest = (req, res, next) => {
  const {
    userId,
    email,
    newPassword,
    re_newPassword,
    newRole,
    address,
    recieverPhoneNumber,
    recieverName,
  } = req.body;

  if (!address || !recieverPhoneNumber || !recieverName) {
    return res.status(400).json({ message: "Please fill in all information" });
  }

  if (!newRole) {
    return res
      .status(400)
      .json({ status: false, message: "New role is required!" });
  }

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

exports.validateRegister = (req, res, next) => {
  const { email, phoneNumber, password, re_password, name } = req.body;

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

  if (!phoneNumber) {
    return res
      .status(400)
      .json({ status: false, message: "Phone number is required!" });
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

