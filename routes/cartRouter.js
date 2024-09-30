const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

const { protect } = require("../middlewares/authMiddleware");
//  localhost:3000/products
const ProductsController = require('../controllers/productsController')

// url: http://localhost:3000/cart

// Add product to cart
router.post("/add-product-to-cart", protect, cartController.addProductToCart)

// Update the quantity of a product in the cart
router.post("/update-cart-quantity", protect, cartController.updateCartQuantity)

// Remove a product from the cart
router.post("/remove-product-from-cart", protect, cartController.removeProductFromCart)

// Calculate the total value of the cart
router.post("/calculate-cart-total", protect, cartController.calculateCartTotal)

// Clear the entire cart
router.post("/clear-cart", protect, cartController.clearCart)


module.exports = router