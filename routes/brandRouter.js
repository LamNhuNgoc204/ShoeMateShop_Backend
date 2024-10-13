const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { managerMiddleware } = require("../middlewares/adminMiddleware");

const controller = require("../controllers/brandController");
const { validateCreateCategory } = require("../middlewares/categoryMiddleware");

// http://localhost:3000/brands

router.post(
  "/add-new-brand",
  protect,
  managerMiddleware,
  validateCreateCategory,
  controller.createBrand
);

module.exports = router;
