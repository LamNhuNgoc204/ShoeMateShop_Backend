const Order = require("../models/orderModel");
const OrderDetail = require("../models/orderDetailModel");
const Voucher = require("../models/voucherModel");
const Payment = require("../models/paymentModel");
const Size = require("../models/sizeModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

// API Create a new order
exports.createNewOrder = async (req, res) => {
    let { user_id, voucher_id, payment_method, receiver, receiverPhone, address, items, total_price } = req.body;
  
    try {
      // Validate user
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Validate payment method
      const payment = new Payment({ payment_method, status: "pending" });
      await payment.save();
  
      // Apply voucher (if provided)
      let discount = 0;
      if (voucher_id) {
        const voucher = await Voucher.findById(voucher_id);
        if (!voucher || voucher.status !== "active") {
          return res.status(400).json({ message: "Invalid or inactive voucher" });
        }
  
        // Check if voucher is applicable
        if (total_price < voucher.min_order_value) {
          return res.status(400).json({ message: "Order value does not meet the voucher's minimum requirement" });
        }
  
        discount = Math.min(voucher.discount_value, voucher.max_discount_value);
        total_price -= discount;
  
        // Mark voucher as used by the user
        voucher.usedBy.push(user._id);
        await voucher.save();
      }
  
      // Create new order
      const newOrder = new Order({
        payment_id: payment._id,
        voucher_id: voucher_id || null,
        status: "pending",
        total_price,
        user_id: user._id,
        receiver,
        receiverPhone,
        address,
      });
      await newOrder.save();
  
      // Create order details (for each item)
      for (const item of items) {
        const { product_id, size_id, quantity } = item;
  
        // Validate product and size
        const product = await Product.findById(product_id);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }
        const size = await Size.findById(size_id);
        if (!size) {
          return res.status(404).json({ message: "Size not found" });
        }
  
        // Check if product quantity is sufficient
        if (product.quantity < quantity) {
          return res.status(400).json({ message: `Not enough quantity for product ${product.name}` });
        }
  
        // Create order detail
        const orderDetail = new OrderDetail({
          order_id: newOrder._id,
          size_id: size._id,
          quantity,
          size_name: size.name,
          product: product._id,
        });
        await orderDetail.save();
  
        // Decrease product quantity
        product.quantity -= quantity;
        product.sold += quantity;
        await product.save();
      }
  
      // Return success response
      res.status(201).json({ message: "Order created successfully", order_id: newOrder._id });
  
    } catch (error) {
      console.error("Error creating order:", error);  // Logs the specific error for debugging
      res.status(500).json({ message: `An error occurred while creating the order: ${error.message}` });
    }
  };