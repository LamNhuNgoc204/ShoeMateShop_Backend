const express = require("express");
const router = express.Router();
const empController = require("../controllers/employeeController");
const { addNewEmployee } = require("../middlewares/userMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { protect } = require("../middlewares/authMiddleware");

// url: http://localhost:3000/employees

// add new employee
router.post(
  "/add-new-employee",
  protect,
  adminMiddleware,
  addNewEmployee,
  empController.addEmployee
);

// Get all employees
router.get(
  "/get-all-employee",
  protect,
  adminMiddleware,
  empController.getAllEmployee
);

// Get employee information
router.get(
  "/get-employee-information/:employeeId",
  empController.getEmployeeInfor
);

module.exports = router;
