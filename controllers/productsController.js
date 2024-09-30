const Product = require("../models/productModel");
const Wishlist = require("../models/wishlistModel");

// Thêm sản phẩm mới (Chỉ admin hoặc nhân viên)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, avatar, quantity, discount, brand, category, size, assets } = req.body;
    
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
      assets // assets là mảng URL
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
    const { name, description, price, avatar, quantity, discount, brand, category, size, assets } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, avatar, quantity, discount, brand, category, size, assets },
      { new: true, runValidators: true }
    );
    
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
      .populate("brand category size") // Không cần populate assets vì assets là URL
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
    const product = await Product.findById(req.params.id).populate("brand category size");
    
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
    })
    .populate("brand category size") 
    .populate({
      path: 'size',
      select: 'name' 
    });
    
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

    const existingWishlistItem = await Wishlist.findOne({ user_id: userId, product_id: productId });

    if (!existingWishlistItem) {
      const newWishlistItem = new Wishlist({
        user_id: userId,
        product_id: productId
      });

      await newWishlistItem.save();
    }

    const wishlist = await Wishlist.find({ user_id: userId }).populate("product_id");
    
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Error adding to wishlist", error });
  }
};

// Xóa sản phẩm khỏi danh sách yêu thích
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.id;

    await Wishlist.findOneAndDelete({ user_id: userId, product_id: productId });

    const wishlist = await Wishlist.find({ user_id: userId }).populate("product_id");

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Error removing from wishlist", error });
  }
};
// Lấy danh sách sản phẩm yêu thích
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    const wishlistItems = await Wishlist.find({ user_id: userId }).populate("product_id");
    res.status(200).json({ status: true, data: wishlistItems });
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist", error });
  }
};