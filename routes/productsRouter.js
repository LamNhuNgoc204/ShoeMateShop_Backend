const express = require("express");
const router = express.Router();
const productController = require("../controllers/productsController");
const { protect, adminOrEmployee } = require("../middlewares/authMiddleware");

//  http://localhost:3000/products

// API thêm sản phẩm (chỉ admin hoặc nhân viên)
router.post("/add", protect, adminOrEmployee, productController.createProduct);

// API cập nhật sản phẩm (chỉ admin hoặc nhân viên)
router.put(
  "/update/:id",
  protect,
  adminOrEmployee,
  productController.updateProduct
);

// API xóa sản phẩm (chỉ admin hoặc nhân viên)
router.delete(
  "/delete/:id",
  protect,
  adminOrEmployee,
  productController.deleteProduct
);

// API lấy tất cả sản phẩm
router.get("/list-products", protect, productController.getAllProducts);

// API lấy sản phẩm theo ID
router.get("/detail/:id", protect, productController.getProductById);

// API tìm kiếm sản phẩm
router.get("/search", productController.searchProducts);

// API thêm sản phẩm vào danh sách yêu thích
router.post("/wishlist/add/:id", protect, productController.addToWishlist);

// API xóa sản phẩm khỏi danh sách yêu thích
router.delete(
  "/wishlist/remove/:id",
  protect,
  productController.removeFromWishlist
);
// API lấy danh sách sản phẩm yêu thích
router.get("/wishlist/list", protect, productController.getWishlist);

//Lấy tất cả thương hiệu
router.get("/list-brands", protect, productController.getAllBrands);

// Lấy tất cả danh mục
router.get("/list-categories", protect, productController.getAllCate);

// Lấy tất cả sizes
router.get("/list-sizes", protect, productController.getAllSize);

module.exports = router;
