const User = require("../models/userModel");
const { hashPassword } = require("../utils/encryptionUtils");

exports.addEmployee = async (req, res) => {
  try {
    const { email, phoneNumber, name, password, role } = req.body;

    const pass = await hashPassword(password);

    const newEmployee = new User({
      email,
      phoneNumber,
      name,
      password: pass,
      role: role || "employee",
    });

    await newEmployee.save();

    return res.status(200).json({
      status: true,
      message: "Add new employee suceesfully",
      data: newEmployee,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getAllEmployee = async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" });

    return res.status(200).json({
      status: true,
      message: "Get data successfully",
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
