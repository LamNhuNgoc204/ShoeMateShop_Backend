const express = require("express");
const router = express.Router();
const empController = require("../controllers/employeeController");
const {
  checkEmployeeFields,
  checkEmployee,
} = require("../middlewares/userMiddleware");
const {
  adminMiddleware,
  managerMiddleware,
} = require("../middlewares/adminMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const { checkReviewById } = require("../middlewares/reviewMiddleware");
const { checkOrder } = require("../middlewares/errorMiddleware");

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

// Review feedback
router.post(
  "/:reviewId/respond/:employeeId",
  checkReviewById,
  checkEmployee,
  empController.reviewFeedback
);

// Delete employee
router.patch(
  "/delete-employee/:employeeId",
  protect,
  adminMiddleware,
  checkEmployee,
  empController.deleteEmployee
);

// search employee
router.get("/search-employee", empController.research);

// refund order
router.post(
  "/handle-refund/:orderDetailId",
  protect,
  managerMiddleware,
  checkOrder,
  empController.refundOrder
);

// Comfirm order
router.put(
  "/comfirm-order/:orderId",
  protect,
  managerMiddleware,
  checkOrder,
  empController.comfirmOrder
);

module.exports = router;
