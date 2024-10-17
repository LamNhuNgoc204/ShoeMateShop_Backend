const express = require("express");
const router = express.Router();
const {
  validateCreateCategory,
  validateUpdateCategory,
  checkCateId,
} = require("../middlewares/categoryMiddleware");
const categoryController = require("../controllers/categoryController");
const { protect } = require("../middlewares/authMiddleware");
const { managerMiddleware } = require("../middlewares/adminMiddleware");

//http://localhost:3000/categories

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
  checkCateId,
  protect,
  managerMiddleware,
  categoryController.deleteCategory
);

//update category
router.put(
  "/update-category/:categoryId",
  checkCateId,
  protect,
  managerMiddleware,
  validateUpdateCategory,
  categoryController.updateCategory
);

//get all categories
router.get("/get-categories", categoryController.getAllCategories);

//get category by id
router.get(
  "/get-category/:categoryId",
  checkCateId,
  protect,
  categoryController.getCategory
);

router.get(
  "/get-product-of-cate/:categoryId",
  protect,
  checkCateId,
  categoryController.getProductOfCate
);

module.exports = router;
