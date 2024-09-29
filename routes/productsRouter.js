const express = require("express");
const router = express.Router();
const productController = require("../controllers/productsController");

const { protect, adminOrEmployee } = require("../middlewares/authMiddleware");
//  localhost:3000/products
// API thêm sản phẩm (chỉ admin hoặc nhân viên)
router.post("/add", protect, adminOrEmployee, productController.createProduct);
var express = require('express');
const ProductsController = require('../controllers/productsController')

// url: http://localhost:3000/products

// Add product to cart
router.post("/add-product-to-cart", ProductsController.addProductToCart)

// Update the quantity of a product in the cart
router.post("/update-cart-quantity", ProductsController.updateCartQuantity)

// Remove a product from the cart
router.post("/remove-product-from-cart", ProductsController.removeProductFromCart)

// Calculate the total value of the cart
router.post("/calculate-cart-total", ProductsController.calculateCartTotal)

// Clear the entire cart
router.post("/clear-cart", ProductsController.clearCart)

// API cập nhật sản phẩm (chỉ admin hoặc nhân viên)
router.put("/update/:id", protect, adminOrEmployee, productController.updateProduct);

// API xóa sản phẩm (chỉ admin hoặc nhân viên)
router.delete("/delete/:id", protect, adminOrEmployee, productController.deleteProduct);

// API lấy tất cả sản phẩm
router.get("/list",protect, productController.getAllProducts);

// API lấy sản phẩm theo ID
router.get("/detail/:id", productController.getProductById);

// API tìm kiếm sản phẩm
router.get("/search", productController.searchProducts);

// API thêm sản phẩm vào danh sách yêu thích
router.post("/wishlist/add/:id", protect, productController.addToWishlist);

// API xóa sản phẩm khỏi danh sách yêu thích
router.delete("/wishlist/remove/:id", protect, productController.removeFromWishlist);

// API lấy danh sách sản phẩm yêu thích
router.get("/wishlist/list", protect, productController.getWishlist);

module.exports = router;
