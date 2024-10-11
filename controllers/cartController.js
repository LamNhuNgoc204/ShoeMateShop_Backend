const Product = require("../models/productModel");
const Cart = require("../models/cartModels");
const User = require("../models/userModel");
const Size = require("../models/sizeModel");

// API to add product to cart
exports.addProductToCart = async (req, res) => {
  try {
    const { product_id, size_id, quantity } = req.body;
    const user_id = req.user._id;

    // 2. Check if the size is valid
    const size = await Size.findById(size_id);
    if (!size) {
      return res.status(404).json({ status: false, message: "Size not found" });
    }

    // 3. Check if the product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });
    }

    // 4. Check if the product and size already exist in the user's cart
    let cartItem = await Cart.findOne({ user_id, product_id, size_id });

    if (cartItem) {
      // If the product already exists, increase the quantity
      cartItem.quantity += quantity || 1;
    } else {
      // If not, create a new cart item
      cartItem = new Cart({
        user_id,
        product_id,
        size_id,
        quantity: quantity || 1,
      });

      // Save the new cart item
      await cartItem.save();

      // 5. Add the product to the user's cart
      user.cart.push(cartItem.product_id);
    }

    // 6. Update the user's cart
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Product added to cart successfully",
      cart: user.cart,
    });
  } catch (error) {
    console.log("Error: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to add product to cart" });
  }
};

// API to update the quantity of a product in the cart
exports.updateCartQuantity = async (req, res) => {
  try {
    const { user_id, product_id, size_id, quantity } = req.body;

    // 1. Check if the user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // 2. Check if the product with the given size exists in the user's cart
    let cartItem = await Cart.findOne({ user_id, product_id, size_id });
    if (!cartItem) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found in the cart" });
    }

    // 3. Update the quantity of the cart item
    if (quantity <= 0) {
      // If the quantity is zero or less, remove the item from the cart
      await Cart.deleteOne({ _id: cartItem._id });
      user.cart = user.cart.filter(
        (item) => item.toString() !== cartItem._id.toString()
      );
      await user.save();

      return res.status(200).json({
        status: true,
        message: "Product removed from cart successfully",
      });
    } else {
      // Update the quantity and save
      cartItem.quantity = quantity;
      await cartItem.save();

      return res.status(200).json({
        status: true,
        message: "Product quantity updated successfully",
        cartItem,
      });
    }
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({
      status: false,
      message: "Failed to update product quantity in cart",
    });
  }
};

// API to remove a product from the cart
exports.removeProductFromCart = async (req, res) => {
  try {
    const { user_id, product_id, size_id } = req.body;

    // 1. Check if the user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // 2. Check if the product with the given size exists in the user's cart
    let cartItem = await Cart.findOne({ user_id, product_id, size_id });
    if (!cartItem) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found in the cart" });
    }

    // 3. Remove the cart item from the Cart collection
    await Cart.deleteOne({ _id: cartItem._id });

    // 4. Remove the product reference from the user's cart array
    user.cart = user.cart.filter(
      (item) => item.toString() !== cartItem._id.toString()
    );
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Product removed from cart successfully",
    });
  } catch (error) {
    console.log("Error: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to remove product from cart" });
  }
};

// API to calculate the total value of the cart
exports.calculateCartTotal = async (req, res) => {
  try {
    const { user_id } = req.body;

    // 1. Check if the user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // 2. Get the cart items for the user
    let cartItems = await Cart.find({ user_id }); // Lấy tất cả sản phẩm trong giỏ hàng của người dùng

    if (!cartItems.length) {
      return res.status(400).json({ status: false, message: "Cart is empty" });
    }

    let total = 0;

    // 3. Loop through the cart items to calculate the total price
    for (let cartItem of cartItems) {
      // Sử dụng product_id từ cartItem để truy vấn sản phẩm
      const product = await Product.findById(cartItem.product_id); // Truy vấn sản phẩm dựa trên product_id

      // Kiểm tra sản phẩm tồn tại
      if (product) {
        // Tính giá sau khi giảm giá nếu có
        const finalPrice = product.price * (1 - (product.discount || 0) / 100);
        total += finalPrice * cartItem.quantity; // Cộng giá trị vào tổng
      } else {
        console.warn(`Product with ID ${cartItem.product_id} not found.`);
      }
    }

    // 4. Return the total price of the cart
    return res.status(200).json({
      status: true,
      message: "Cart total calculated successfully",
      total: total.toFixed(2),
    });
  } catch (error) {
    console.log("Error: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to calculate cart total" });
  }
};
// API to clear the entire cart
exports.clearCart = async (req, res) => {
  try {
    const { user_id } = req.body;

    // 1. Check if the user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // 2. Check if the user's cart is empty
    if (!user.cart.length) {
      return res
        .status(400)
        .json({ status: false, message: "Cart is already empty" });
    }

    // 3. Remove all items in the user's cart
    await Cart.deleteMany({ user_id });

    // 4. Clear the cart array in the user's document
    user.cart = [];
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.log("Error: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to clear cart" });
  }
};
