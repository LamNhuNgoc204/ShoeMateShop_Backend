const express = require("express");
const router = express.Router();
const {
  validateCreateCategory,
  validateUpdateCategory,
} = require("../middlewares/categoryMiddleware");
const categoryController = require("../controllers/categoryController");
const { protect } = require("../middlewares/authMiddleware");
const { managerMiddleware } = require("../middlewares/adminMiddleware");

//http:localhost:3000/categories

//create category
router.post(
  "/create-category",
  protect,
  managerMiddleware,
  validateCreateCategory,
  categoryController.createCategory
);

//delete category
router.delete(
  "/delete-category/:categoryId",
  protect,
  managerMiddleware,
  categoryController.deleteCategory
);

//update category
router.put(
  "/update-category/:categoryId",
  protect,
  managerMiddleware,
  validateUpdateCategory,
  categoryController.updateCategory
);

//get all categories
router.get("/get-categories", protect, categoryController.getAllCategories);

//get category by id
router.get("/get-category/:id", protect, categoryController.getCategory);

module.exports = router;
