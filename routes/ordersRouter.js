var express = require("express");
var router = express.Router();
const control = require("../controllers/ordersController");
const { protect, adminOrEmployee } = require("../middlewares/authMiddleware");
const middle = require("../middlewares/orderMiddle");

//http://localhost:3000/orders

router.post(
  "/create-new-order",
  protect,
  middle.validateOrder,
  control.createNewOrder
);

router.get("/get-order-detail/:orderId", protect, control.getOrderDetail);

router.get(
  "/get-user-order",
  protect,
  middle.checkUserOrder,
  control.getUserOrder
);

router.get(
  "/get-user-order-pending",
  protect,
  middle.checkUserOrder,
  control.getPendingOrders
);

router.get(
  "/get-user-order-processing",
  protect,
  middle.checkUserOrder,
  control.getProcessingOrders
);

router.get(
  "/get-user-order-completed",
  protect,
  middle.checkUserOrder,
  control.getCompletedOrders
);

router.get(
  "/get-user-order-cancell",
  protect,
  middle.checkUserOrder,
  control.getCancelledOrders
);

router.get(
  "/get-user-order-refunded",
  protect,
  middle.checkUserOrder,
  control.getRefundedOrders
);

router.get(
  "/get-all-orders",
  protect,
  adminOrEmployee,
  control.getAllOrdersForAdmin
);

router.put(
  "/update-order-address/:orderId",
  protect,
  middle.checkOrderUpdate,
  control.updateOrderAddress
);

//Yeu cau hoan hang tu nguoi dung
router.put(
  "/request-return-order/:orderId",
  protect,
  middle.checkOrderByID,
  control.requestReturnOrder
);

//Xu ly yeu cau hoan hang
router.put(
  "/return-request/:orderId",
  protect,
  adminOrEmployee,
  middle.checkOrderByID,
  control.handleReturnRq
);

//Huy don tu phia nguoi dung
router.put(
  "/cancel-order/:orderId",
  protect,
  middle.checkOrderByID,
  control.cancelOrder
);

//Xac nhan hoac huy don hang (admin || staff)
router.put(
  "/confirm-order/:orderId",
  protect,
  adminOrEmployee,
  middle.checkOrderByID,
  control.confirmOrder
);

module.exports = router;
