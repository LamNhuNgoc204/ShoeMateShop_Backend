var express = require('express');
var router = express.Router();
const orderController = require("../controllers/ordersController");

//http://localhost:3000/orders

//Create a new order
router.post("/create-new-order", orderController.createNewOrder);

//Update order status
router.post("/update-order-status", orderController.updateOrderStatus);

//Get user's order history
router.get("/user-order-history/:user_id", orderController.getUserOrderHistory);

//Cancel an order
router.delete("/cancel-order/:order_id", orderController.cancelOrder);

//Get order details
router.get("/order-details/:order_id", orderController.getOrderDetails);

//Get order status
router.get("/order-status/:order_id", orderController.getOrderStatus);

//Create a return request
router.post("/return-request/:order_id", orderController.createReturnRequest);

//Get all return requests
router.get("/return-requests", orderController.getAllReturnRequests);

//Get completed orders by user
router.get("/completed-orders/:user_id", orderController.getCompletedOrdersByUser);

//Get all orders
router.get("/all-orders", orderController.getAllOrders);

//Get pending orders by user
router.get("/pending-orders/:user_id", orderController.getPendingOrdersByUser);

//Get canceled orders
router.get("/canceled-orders", orderController.getCanceledOrders);

//Get completed orders
router.get("/completed-orders", orderController.getCompletedOrders);


module.exports = router;