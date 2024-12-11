const express = require("express");
const router = express.Router();
const controller = require("../controllers/sizeController");
const { managerMiddleware } = require("../middlewares/adminMiddleware");
const { protect } = require("../middlewares/authMiddleware");

// http://localhost:3000/sizes

router.post("/add-new-size", protect, managerMiddleware, controller.createSize);

router.post("/get-all-sizes", protect, controller.getAllSizes);

router.get(
  "/get-products-by-sizeid/:sizeId",
  protect,
  controller.getLstProductbySize
);

router.delete(
  "/delete-size/:sizeId",
  protect,
  managerMiddleware,
  controller.deleteSize
);

module.exports = router;
