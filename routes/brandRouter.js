const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { managerMiddleware } = require("../middlewares/adminMiddleware");

const controller = require("../controllers/brandController");
const { validateCreateCategory } = require("../middlewares/categoryMiddleware");
const { checckBrandId } = require("../middlewares/errorMiddleware");

// http://localhost:3000/brands

router.post(
  "/add-new-brand",
  protect,
  managerMiddleware,
  validateCreateCategory,
  controller.createBrand
);

router.get(
  "/get-product-of-brand/:brandId",
  checckBrandId,
  protect,
  managerMiddleware,
  controller.getAllProductOfBrand
);

router.put(
  "/update-brands/:brandId",
  checckBrandId,
  protect,
  managerMiddleware,
  controller.updateBrand
);

module.exports = router;
