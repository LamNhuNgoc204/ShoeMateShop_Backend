const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

const { protect } = require("../middlewares/authMiddleware");

// http://localhost:3000/cart

// Add product to cart
router.post("/add-product-to-cart", protect, cartController.addProductToCart);

//lấy giỏ hàng
router.get("/get-user-card", protect, cartController.getUserCard);

// Update the quantity of a product in the cart
router.put("/update-cart-quantity", protect, cartController.updateCartQuantity);

// Remove a product from the cart
router.post(
  "/remove-product-from-cart",
  protect,
  cartController.removeProductFromCart
);

// Calculate the total value of the cart
router.post(
  "/calculate-cart-total",
  protect,
  cartController.calculateCartTotal
);

// Clear the entire cart
router.delete("/clear-cart", protect, cartController.clearCart);

// Get Cart By User Id
router.get("/get-cart-by-user-id", protect, cartController.getCartByUserId);

module.exports = router;
