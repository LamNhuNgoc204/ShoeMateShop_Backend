var express = require('express');
var router = express.Router();
const orderController = require("../controllers/ordersController");

//  http://localhost:3000/orders

//Create a new order
router.post("/create-new-order", orderController.createNewOrder);

module.exports = router;