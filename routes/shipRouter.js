const express = require("express");
const control = require("../controllers/shipController");
const { protect } = require("../middlewares/authMiddleware");
const { managerMiddleware } = require("../middlewares/adminMiddleware");
const router = express.Router();

//url: http://localhost:3000/ship

router.post(
  "/shipping-companies",
  protect,
  managerMiddleware,
  control.createShip
);

router.get("/ship-default", control.getShipDefault);

router.get("/get-shipping", protect, control.getShip);

router.get("/get-one-ship/:id", control.getOneShip);

router.put("update-ship/:id", protect, managerMiddleware, control.updateShip);

router.get(
  "/get-order-forship",
  protect,
  managerMiddleware,
  control.getOrderForShip
);

module.exports = router;
