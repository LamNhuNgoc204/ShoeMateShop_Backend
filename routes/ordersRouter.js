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

router.put(
  "/request-return-order/:orderId",
  protect,
  middle.checkOrderByID,
  control.requestReturnOrder
);

router.put(
  "/return-request/:orderId",
  protect,
  adminOrEmployee,
  middle.checkOrderByID,
  control.handleReturnRq
);

router.put(
  "/cancel-order/:orderId",
  // protect,
  middle.checkOrderByID,
  control.cancelOrder
);

module.exports = router;

// //Create a new order
// router.post("/create-new-order", protect, orderController.createNewOrder);

// //Update order status
// router.post("/update-order-status", adminOrEmployee, orderController.updateOrderStatus);

// //Get user's order history
// router.get("/user-order-history/:user_id", adminOrEmployee, orderController.getUserOrderHistory);

// //Cancel an order
// router.delete("/cancel-order/:order_id", orderController.cancelOrder);

// //Get order details
// router.get("/order-details/:order_id", orderController.getOrderDetails);

// //Get order status
// router.get("/order-status/:order_id", orderController.getOrderStatus);

// //Create a return request
// router.post("/return-request/:order_id", orderController.createReturnRequest);

// //Get all return requests
// router.get("/return-requests", orderController.getAllReturnRequests);

// //Get completed orders by user
// router.get("/completed-orders/:user_id", orderController.getCompletedOrdersByUser);

// //Get all orders
// router.get("/all-orders", orderController.getAllOrders);

// //Get pending orders by user
// router.get("/pending-orders/:user_id", adminOrEmployee, orderController.getPendingOrdersByUser);

// //Get canceled orders
// router.get("/canceled-orders", adminOrEmployee, orderController.getCanceledOrders);

// //Get completed orders
// router.get("/completed-orders", adminOrEmployee, orderController.getCompletedOrders);
