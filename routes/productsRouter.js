var express = require('express');
var router = express.Router();
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

module.exports = router;