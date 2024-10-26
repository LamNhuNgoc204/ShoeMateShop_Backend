const Product = require("../models/productModel");
const Cart = require("../models/cartModels");
const Size = require("../models/sizeModel");

exports.getUserCard = async (req, res) => {
  try {
    const userId = req.user._id;

    const userCard = await Cart.find({ user_id: userId })
      .populate("product_id", "assets name price")
      .populate("size_id", "name");

    return res.status(200).json({ status: true, data: userCard });
  } catch (error) {
    console.log("error", error);

    return res.status(500).json({
      status: false,
      message: "Failed to add product to cart",
      error: error,
    });
  }
};

// API để thêm sản phẩm vào giỏ hàng
exports.addProductToCart = async (req, res) => {
  try {
    const { product_id, size_id, quantity } = req.body;
    const user = req.user;
    const user_id = req.user._id;

    // Kiểm tra xem sản phẩm có tồn tại hay không và lấy kích thước
    const product = await Product.findById(product_id).populate("size");
    if (!product)
      return res
        .status(404)
        .json({ status: false, message: "Product not found" });

    // Kiểm tra xem kích thước có tồn tại trong bộ sưu tập Size cho sản phẩm này không
    const size = await Size.findById(size_id);
    if (!size) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid size for this product" });
      return res
        .status(400)
        .json({ status: false, message: "Invalid size for this product" });
    }

    // Kiểm tra xem sản phẩm và kích thước đã tồn tại trong giỏ hàng của người dùng chưa
    let cartItem = await Cart.findOne({
      user_id,
      product_id,
      size_id: size_id,
    });

    if (cartItem) {
      // Nếu sản phẩm đã tồn tại, tăng số lượng
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Nếu không, tạo một mục giỏ hàng mới
      cartItem = new Cart({ user_id, product_id, size_id: size._id, quantity });
      await cartItem.save();

      // Thêm mục giỏ hàng mới vào giỏ hàng của người dùng
      user.cart.push(cartItem._id);
      await user.save();
    }

    return res.status(200).json({
      status: true,
      message: "Product added to cart successfully",
      cart: user.cart,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to add product to cart" });
  }
};

// API để cập nhật số lượng của sản phẩm trong giỏ hàng
exports.updateCartQuantity = async (req, res) => {
  try {
    const { product_id, size_id, quantity } = req.body;
    const user_id = req.user._id;

    // Kiểm tra xem kích thước có tồn tại không
    const size = await Size.findById(size_id);
    if (!size) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid size for this product" });
    }

    // Kiểm tra xem sản phẩm có trong giỏ hàng không
    let cartItem = await Cart.findOne({
      user_id,
      product_id,
      size_id,
    });
    if (!cartItem) {
      return res
        .status(404)
        .json({ status: false, message: "Product not found in the cart" });
    }

    // Cập nhật số lượng của mục giỏ hàng
    if (quantity <= 0) {
      // Nếu số lượng bằng 0 hoặc ít hơn, xóa mục khỏi giỏ hàng
      await Cart.deleteOne({ _id: cartItem._id });

      return res.status(200).json({
        status: true,
        message: "Product removed from cart successfully",
      });
    } else {
      // Cập nhật số lượng và lưu lại
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
    return res.status(500).json({
      status: false,
      message: "Failed to update product quantity in cart",
    });
  }
};

// API để xóa một sản phẩm khỏi giỏ hàng
exports.removeProductFromCart = async (req, res) => {
  try {
    const { product_id, size_name } = req.body;
    const user_id = req.user._id;

    if (!product_id || !size_name) {
      console.log("Missing product_id or size_name");
      return res
        .status(400)
        .json({ status: false, message: "Missing product_id or size_name" });
    }

    // Kiểm tra xem kích thước có tồn tại trong bộ sưu tập Size cho sản phẩm này không
    const size = await Size.findOne({ name: size_name });
    if (!size) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid size for this product" });
    }

    const product = await Product.findById(product_id);
    if (!product)
      return res
        .status(401)
        .json({ status: false, message: "Product not found" });

    const cartItem = await Cart.findOne({
      user_id,
      product_id,
      size_id: size._id,
    });

    if (!cartItem) {
      console.log("Product not found in the cart for user:", user_id);
      return res
        .status(404)
        .json({ status: false, message: "Product not found in the cart" });
    }

    // Xóa mục giỏ hàng từ bộ sưu tập Cart
    await Cart.deleteOne({ _id: cartItem._id });
    console.log("Deleted cartItem:", cartItem._id);

    return res.status(200).json({
      status: true,
      message: "Product removed from cart successfully",
    });
  } catch (error) {
    console.error("Error removing product from cart: ", error);
    return res.status(500).json({
      status: false,
      message: "Failed to remove product from cart",
      error: error,
    });
  }
};

// API để tính tổng giá trị của giỏ hàng
exports.calculateCartTotal = async (req, res) => {
  try {
    const user_id = req.user._id;

    // Lấy tất cả sản phẩm trong giỏ hàng của người dùng
    let cartItems = await Cart.find({ user_id }); // Lấy tất cả sản phẩm trong giỏ hàng của người dùng

    if (!cartItems.length) {
      return res.status(400).json({ status: false, message: "Cart is empty" });
    }

    // Tạo một mảng chứa tất cả product_id từ cartItems
    const productIds = cartItems.map((cartItem) => cartItem.product_id);

    // Lấy tất cả sản phẩm cùng một lúc
    const products = await Product.find({ _id: { $in: productIds } });

    // Tạo một map để ánh xạ product_id với sản phẩm
    const productMap = {};
    products.forEach((product) => {
      productMap[product._id] = product;
    });

    let total = 0;

    // Tính tổng giá trị giỏ hàng
    for (let cartItem of cartItems) {
      const product = productMap[cartItem.product_id];

      if (product) {
        // Tính giá sau khi giảm giá nếu có
        const finalPrice = product.price * (1 - (product.discount || 0) / 100);
        total += finalPrice * cartItem.quantity; // Cộng giá trị vào tổng
      } else {
        console.warn(`Product with ID ${cartItem.product_id} not found.`);
      }
    }

    // Trả về tổng giá trị giỏ hàng
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

// API để xóa toàn bộ giỏ hàng
exports.clearCart = async (req, res) => {
  try {
    const user_id = req.user._id;

    // Kiểm tra xem giỏ hàng của người dùng có trống không
    const cartItems = await Cart.find({ user_id });

    if (!cartItems.length) {
      return res
        .status(400)
        .json({ status: false, message: "Cart is already empty" });
    }

    // Xóa tất cả sản phẩm trong giỏ hàng của người dùng
    await Cart.deleteMany({ user_id });

    return res.status(200).json({
      status: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Failed to clear cart" });
  }
};

// API để lấy chi tiết giỏ hàng của người dùng
exports.getCartByUserId = async (req, res) => {
  try {
    const user_id = req.user._id;

    let cartItems = await Cart.find({ user_id });

    if (!cartItems.length) {
      return res.status(404).json({ status: false, message: "Giỏ hàng trống" });
    }

    const cartDetails = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.product_id);
      const size = await Size.findById(item.size_id);

      if (!product || !size) {
        console.warn(
          `Không tìm thấy sản phẩm hoặc kích thước cho item ID: ${item._id}`
        );
        continue;
      }

      cartDetails.push({
        name: product.name,
        product_id: product._id,
        assets: product.assets,
        price: product.price,
        productDiscount: product.discount,
        sizeName: size.name,
        size_id: size._id,
        quantity: item.quantity,
        finalPrice: (
          product.price *
          (1 - (product.discount || 0) / 100)
        ).toFixed(2),
      });
    }

    return res.status(200).json({
      status: true,
      message: "Lấy giỏ hàng thành công",
      cart: cartDetails,
    });
  } catch (error) {
    console.log("Lỗi: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Lấy chi tiết giỏ hàng thất bại" });
  }
};
