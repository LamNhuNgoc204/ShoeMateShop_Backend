const express = require("express");
const router = express.Router();
const empController = require("../controllers/employeeController");
const { addNewEmployee } = require("../middlewares/userMiddleware");

// url: http://localhost:3000/employees

// add new employee
router.post("/add-new-employee", addNewEmployee, empController.addEmployee);

module.exports = router;
