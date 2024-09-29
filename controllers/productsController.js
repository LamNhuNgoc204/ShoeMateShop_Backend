const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel");
const Cart = require("../models/cartModels");
const User = require("../models/userModel");
const Size = require("../models/sizeModel");
// Thêm sản phẩm mới (Chỉ admin hoặc nhân viên)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price,avatar, quantity, discount, brand, category, size, assets } = req.body;
    
    const newProduct = new Product({
      name,
      description,
      price,
      avatar,
      quantity,
      discount,
      brand,
      category,
      size,
      assets
    });
    
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error });
  }
};

// Cập nhật sản phẩm theo ID (Chỉ admin hoặc nhân viên)
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
};

// Xóa sản phẩm theo ID (Chỉ admin hoặc nhân viên)
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(200).json({ status: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

// Lấy danh sách tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
    try {
      const products = await Product.find()
        .populate("brand category size assets") 
        .populate({
          path: 'assets',
          select: 'assetUrl' 
        })
        .populate({
          path: 'size',
          select: 'name' 
        });
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products", error });
    }
  };
  

// Lấy chi tiết sản phẩm theo ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("brand category size assets");
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};

// Tìm kiếm sản phẩm theo tên hoặc mô tả
exports.searchProducts = async (req, res) => {
  const { query } = req.query;
  
  try {
    const products = await Product.find({
      $or: [
        { name: new RegExp(query, "i") },
        { description: new RegExp(query, "i") }
      ]
    }).populate("brand category size assets");
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error searching products", error });
  }
};

// Thêm sản phẩm vào danh sách yêu thích
exports.addToWishlist = async (req, res) => {
    try {
      const userId = req.user._id; 
      const productId = req.params.id;
  
      // Kiểm tra xem sản phẩm đã có trong danh sách yêu thích chưa
      const existingWishlistItem = await Wishlist.findOne({ user_id: userId, product_id: productId });
  
      if (!existingWishlistItem) {
        // Nếu chưa có, tạo một mục mới trong danh sách yêu thích
        const newWishlistItem = new Wishlist({
          user_id: userId,
          product_id: productId
        });
  
        await newWishlistItem.save(); // Lưu vào cơ sở dữ liệu
      }
  
      // Lấy danh sách yêu thích hiện tại của người dùng
      const wishlist = await Wishlist.find({ user_id: userId }).populate("product_id");
      
      res.status(200).json(wishlist); // Trả về danh sách yêu thích
    } catch (error) {
      res.status(500).json({ message: "Error adding to wishlist", error });
    }
  };

// Xóa sản phẩm khỏi danh sách yêu thích
exports.removeFromWishlist = async (req, res) => {
  try {
    const user = req.user;
    const productId = req.params.id;

    user.wishlist = user.wishlist.filter(item => item.toString() !== productId);
    await user.save();

    res.status(200).json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: "Error removing from wishlist", error });
  }
};

// Lấy danh sách sản phẩm yêu thích
exports.getWishlist = async (req, res) => {
    try {
      const user = req.user;
      const wishlistItems = await Wishlist.find({ user_id: user._id }).populate("product_id");
      
      res.status(200).json({status:true, data:wishlistItems});
    } catch (error) {
      res.status(500).json({ message: "Error fetching wishlist", error });
    }
  };
  


// API to add product to cart
exports.addProductToCart = async (req, res) => {
  try {
    const { user_id, product_id, size_id, quantity } = req.body;

    // 1. Check if the user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // 2. Check if the size is valid
    const size = await Size.findById(size_id);
    if (!size) {
      return res.status(404).json({ status: false, message: "Size not found" });
    }

    // 3. Check if the product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ status: false, message: "Product not found" });
    }

    // 4. Check if the product already exists in the user's cart
    let cartItem = await Cart.findOne({ user_id, size_id });

    if (cartItem) {
      // If the product already exists, increase the quantity
      cartItem.quantity += quantity || 1;
    } else {
      // If not, create a new cart item
      cartItem = new Cart({
        user_id,
        size_id,
        quantity: quantity || 1,
      });

      // Save the new cart item
      await cartItem.save();

      // 5. Add the product to the user's cart
      user.cart.push(cartItem._id);
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
    return res.status(500).json({ status: false, message: "Failed to add product to cart" });
  }
};

// API to update the quantity of a product in the cart
exports.updateCartQuantity = async (req, res) => {
    try {
      const { user_id, size_id, quantity } = req.body;
  
      // 1. Check if the user exists
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ status: false, message: "User not found" });
      }
  
      // 2. Check if the product with the given size exists in the user's cart
      let cartItem = await Cart.findOne({ user_id, size_id });
      if (!cartItem) {
        return res.status(404).json({ status: false, message: "Product not found in the cart" });
      }
  
      // 3. Update the quantity of the cart item
      if (quantity <= 0) {
        // If the quantity is zero or less, remove the item from the cart
        await Cart.deleteOne({ _id: cartItem._id });
        // Remove the item from the user's cart reference
        user.cart = user.cart.filter((item) => item.toString() !== cartItem._id.toString());
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
      return res.status(500).json({ status: false, message: "Failed to update product quantity in cart" });
    }
  };

// API to remove a product from the cart
exports.removeProductFromCart = async (req, res) => {
    try {
      const { user_id, size_id } = req.body;
  
      // 1. Check if the user exists
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ status: false, message: "User not found" });
      }
  
      // 2. Check if the product with the given size exists in the user's cart
      let cartItem = await Cart.findOne({ user_id, size_id });
      if (!cartItem) {
        return res.status(404).json({ status: false, message: "Product not found in the cart" });
      }
  
      // 3. Remove the cart item from the Cart collection
      await Cart.deleteOne({ _id: cartItem._id });
  
      // 4. Remove the product reference from the user's cart array
      user.cart = user.cart.filter((item) => item.toString() !== cartItem._id.toString());
      await user.save();
  
      return res.status(200).json({
        status: true,
        message: "Product removed from cart successfully",
      });
    } catch (error) {
      console.log("Error: ", error);
      return res.status(500).json({ status: false, message: "Failed to remove product from cart" });
    }
  };

// API to calculate the total value of the cart
exports.calculateCartTotal = async (req, res) => {
  try {
    const { user_id } = req.body;

    // 1. Check if the user exists
    const user = await User.findById(user_id).populate("cart");
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // 2. Get the products in the cart
    let cartItems = await Cart.find({ user_id }).populate({
      path: 'size_id',
      select: 'name',
    });

    if (!cartItems.length) {
      return res.status(400).json({ status: false, message: "Cart is empty" });
    }

    let total = 0;

    // 3. Loop through the cart items and calculate the total price
    for (let cartItem of cartItems) {
      const product = await Product.findById(cartItem.size_id).select('price discount');

      // Calculate price after discount if available
      const finalPrice = product.price * (1 - product.discount / 100);
      total += finalPrice * cartItem.quantity;
    }

    // 4. Return the total price of the cart
    return res.status(200).json({
      status: true,
      message: "Cart total calculated successfully",
      total: total.toFixed(2), // Format total to 2 decimal places
    });
  } catch (error) {
    console.log("Error: ", error);
    return res.status(500).json({ status: false, message: "Failed to calculate cart total" });
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
      return res.status(400).json({ status: false, message: "Cart is already empty" });
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
    return res.status(500).json({ status: false, message: "Failed to clear cart" });
  }
};
