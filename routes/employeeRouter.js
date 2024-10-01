const express = require("express");
const router = express.Router();
const empController = require("../controllers/employeeController");
const {
  checkEmployeeFields,
  checkEmployee,
} = require("../middlewares/userMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { protect } = require("../middlewares/authMiddleware");

// url: http://localhost:3000/employees

// add new employee
router.post(
  "/add-new-employee",
  protect,
  adminMiddleware,
  checkEmployeeFields,
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
  checkEmployee,
  empController.getEmployeeInfor
);

// Update employee infor
router.put(
  "/update-employee-information/:employeeId",
  checkEmployee,
  checkEmployeeFields,
  empController.updateInformation
);

module.exports = router;
