const express = require("express");
const {
  createShip,
  getShip,
  getOneShip,
  updateShip,
} = require("../controllers/shipController");
const { protect } = require("../middlewares/authMiddleware");
const { managerMiddleware } = require("../middlewares/adminMiddleware");
const router = express.Router();

//url: http://localhost:3000/ship

router.post("/shipping-companies", protect, managerMiddleware, createShip);

router.get("/get-shipping", protect, getShip);

router.get("/get-one-ship/:id", getOneShip);

router.put("update-ship/:id", protect, managerMiddleware, updateShip);

module.exports = router;
