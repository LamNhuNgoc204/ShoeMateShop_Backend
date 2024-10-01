const User = require("../models/userModel");
const { hashPassword } = require("../utils/encryptionUtils");
const { checkRole } = require("../utils/stringUtils");

exports.addEmployee = async (req, res) => {
  try {
    const { email, phoneNumber, name, password, role } = req.body;

    if (!role) {
      return res.status(400).json({
        status: false,
        message: "Role is required",
      });
    }

    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({
        status: false,
        message: "Email has been used",
      });
    }

    if (!checkRole(role)) {
      return res.status(400).json({ status: false, message: "Invalid role!" });
    }

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

exports.getEmployeeInfor = async (req, res) => {
  try {
    const employee = req.employee;

    return res.status(200).json({
      status: true,
      message: "Get information successfully",
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.updateInformation = async (req, res) => {
  try {
    const { email, phoneNumber, name, password } = req.body;
    const employee = req.employee;

    const pass = await hashPassword(password);

    employee.email = email || employee.email;
    employee.phoneNumber = phoneNumber || employee.phoneNumber;
    employee.name = name || employee.name;
    employee.password = pass || employee.password;

    await employee.save();

    return res.status(200).json({
      status: true,
      message: "Update information successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.reviewFeedback = async (req, res) => {
  try {
    const { content } = req.body;
    const employee = req.employee;
    const review = req.review;

    if (!content) {
      return res.status(400).json({
        status: false,
        message: "Content is required",
      });
    }

    if (review.response && review.response.content) {
      return res.status(400).json({ message: "The review has had feedback" });
    }

    review.responder_id = employee._id;
    review.response = {
      content,
      createdAt: Date.now(),
    };

    await review.save();

    return res.status(200).json({
      status: true,
      message: "Feedback successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = req.employee;

    employee.isActive = false;
    employee.updateAt = Date.now();

    await employee.save();

    return res.status(200).json({
      status: true,
      message: "Delete employee successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};
