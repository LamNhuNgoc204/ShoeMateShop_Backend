const Order = require("../models/orderModel");
const OrderDetail = require("../models/orderDetailModel");
const Payment = require("../models/paymentModel");
const Size = require("../models/sizeModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

exports.createNewOrder = async (req, res) => {
  try {
    const user_id = req.user._id;
    const {
      products,
      method_id,
      voucher_id,
      shipping_id,
      total_price,
      receiver,
      receiverPhone,
      address,
    } = req.body;

    const newPayment = new Payment({
      payment_method_id: method_id,
      amount: total_price,
    });

    const savedPayment = await newPayment.save();
    if (!savedPayment) {
      return res
        .status(400)
        .json({ status: false, message: "Payment creation failed!" });
    }

    const newOrder = new Order({
      user_id,
      payment_id: savedPayment._id,
      voucher_id,
      shipping_id,
      total_price,
      receiver,
      receiverPhone,
      address,
    });

    const savedOrder = await newOrder.save();
    if (!savedOrder) {
      return res
        .status(404)
        .json({ status: false, mesage: "Save order failed!" });
    }

    savedPayment.order_ids.push(savedOrder._id);
    await savedPayment.save();

    const orderDetails = products.map((product) => {
      return new OrderDetail({
        order_id: savedOrder._id,
        quantity: products.length,
        product: {
          id: product.product._id,
          pd_image: product.product.assets,
          name: product.product.name,
          size_name: product.product.size_name,
          price: product.product.price,
          pd_quantity: product.product.quantity,
        },
      });
    });

    await OrderDetail.insertMany(orderDetails);

    return res.status(201).json({
      status: true,
      message: "Order created successfully",
      data: {
        order: savedOrder,
        payment: savedPayment,
        orderDetail: orderDetails,
      },
    });
  } catch (error) {
    console.log("create new order error: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

exports.getUserOrder = async (req, res) => {
  try {
    const orders = req.order;

    const orderIds = orders.map((order) => order._id);
    const orderDetails = await OrderDetail.find({
      order_id: { $in: orderIds },
    }).populate("product.id");

    const categorizedOrders = {
      pending: [],
      processing: [],
      completed: [],
      cancelled: [],
      refunded: [],
    };

    // orders.forEach((order) => {
    //   categorizedOrders[order.status].push(order);
    // });
    orders.forEach((order) => {
      // Lấy OrderDetail tương ứng với đơn hàng hiện tại
      const details = orderDetails.filter((detail) =>
        detail.order_id.equals(order._id)
      );

      // Phân loại đơn hàng theo trạng thái
      categorizedOrders[order.status].push({
        ...order.toObject(),
        orderDetails: details,
      });
    });

    return res.status(201).json({ status: true, data: categorizedOrders });
  } catch (error) {
    console.log("create new order error: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

exports.getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user_id", "username email")
      .populate("payment_id.payment_method_id", "payment_method")
      .populate(
        "voucher_id",
        "discount_value voucher_name min_order_value max_discount_value"
      )
      .populate("shipping_id", "name cost createdAt updatedAt")
      .populate({
        path: "orderDetails",
        select:
          "product.id product.name product.size_name product.price product.pd_image product.pd_quantity",
      });
    return res.status(200).json({ status: true, data: orders });
  } catch (error) {
    console.log("create new order error: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

exports.updateOrderAddress = async (req, res) => {
  try {
    const orderId = req.order._id;
    const { receiver, receiverPhone, address } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { receiver, receiverPhone, address },
      { new: true }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ status: false, message: "Order not found!" });
    }

    return res.status(200).json({
      status: true,
      message: "Order updated successfully!",
      data: updatedOrder,
    });
  } catch (error) {
    console.log("create new order error: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

exports.requestReturnOrder = async (req, res) => {
  try {
    const order = req.order;
    const { reason } = req.body;

    if (!reason) {
      return res
        .status(400)
        .json({ status: false, message: "Reason is required!" });
    }

    if (
      order.status !== "completed" &&
      order.shipping_id.status !== "delivered"
    ) {
      return res.status(400).json({
        status: false,
        message: "Only completed or delivered orders can be returned!",
      });
    }

    order.returnRequest = {
      reason,
      requestDate: Date.now(),
      status: "pending",
    };

    const result = await order.save();
    return res.status(200).json({
      status: true,
      message: "Return request submitted successfully!",
      data: result,
    });
  } catch (error) {
    console.log("create new order error: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

exports.handleReturnRq = async (req, res) => {
  try {
    const order = req.order;
    const { returnStatus } = req.body;

    if (order.returnRequest.status !== "pending") {
      return (
        res.status(400),
        json({ status: false, message: "The request has been processed" })
      );
    }

    const validReturnStatuses = ["accepted", "rejected"];
    if (!validReturnStatuses.includes(returnStatus)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid return status!" });
    }

    order.returnRequest.status = returnStatus;
    order.returnRequest.responseDate = Date.now();

    if (returnStatus === "accepted") {
      order.status = "refunded";
    }

    const result = await order.save();
    if (!result) {
      return res
        .status(400)
        .json({ status: false, message: "Save order failed!" });
    }

    return res.status(200).json({
      status: true,
      message: `Return request ${returnStatus} successfully!`,
      data: order,
    });
  } catch (error) {
    console.log("create new order error: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = req.order;

    if (order.status !== "pending") {
      return res.status(400).json({
        status: false,
        message: "Only pending orders can be cancelled!",
      });
    }

    order.status = "cancelled";
    order.shipping_id.status = "cancelled";
    const result = await order.save();
    if (!result) {
      return res
        .status(400)
        .json({ status: false, mesage: "Order cannot be cancelled" });
    }

    return res.status(200).json({
      status: true,
      message: "Order cancelled successfully!",
      data: result,
    });
  } catch (error) {
    console.log("create new order error: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

// // API Create a new order
// exports.createNewOrder = async (req, res) => {
//   let {
//     voucher_id,
//     payment_method,
//     receiver,
//     receiverPhone,
//     address,
//     items,
//     total_price,
//   } = req.body;

//   const user_id = req.user._id;

//   try {
//     // Validate user
//     const user = await User.findById(user_id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Apply voucher if provided
//     let discount = 0;
//     let voucher = null;
//     if (voucher_id) {
//       voucher = await Voucher.findById(voucher_id);
//       if (!voucher || voucher.status !== "active") {
//         return res.status(400).json({ message: "Invalid or inactive voucher" });
//       }

//       // Check if order meets the voucher's minimum order value
//       if (total_price < voucher.min_order_value) {
//         return res.status(400).json({
//           message: "Order value does not meet the voucher's minimum requirement",
//         });
//       }

//       // Calculate the discount
//       discount = Math.min(voucher.discount_value, voucher.max_discount_value);
//       total_price -= discount;

//       // Mark voucher as used
//       voucher.usedBy.push(user._id);
//       await voucher.save();
//     }

//     // Create the payment record without order_id initially
//     const payment = new Payment({
//       payment_method,
//       status: "pending",
//     });
//     await payment.save();

//     // Create the order
//     const newOrder = new Order({
//       payment_id: payment._id,
//       voucher_id: voucher ? voucher._id : null,
//       status: "pending",
//       total_price,
//       user_id: user._id,
//       receiver,
//       receiverPhone,
//       address,
//     });
//     await newOrder.save();

//     // Now update payment with the new order ID
//     payment.order_id = newOrder._id;
//     await payment.save();

//     // Create order details for each item
//     for (const item of items) {
//       const { product_id, size_id, quantity } = item;

//       // Validate product and size
//       const product = await Product.findById(product_id);
//       if (!product) {
//         return res.status(404).json({ message: "Product not found" });
//       }
//       const size = await Size.findById(size_id);
//       if (!size) {
//         return res.status(404).json({ message: "Size not found" });
//       }
//     }
//     const size = await Size.findById(size_id);
//     if (!size) {
//       return res.status(404).json({ message: "Size not found" });
//     }

//     // Check if product quantity is sufficient
//     if (product.quantity < quantity) {
//       return res.status(400).json({ message: `Not enough quantity for product ${product.name}` });
//     }

//     // Create order detail
//     const orderDetail = new OrderDetail({
//       order_id: newOrder._id,
//       size_id: size._id,
//       quantity,
//       size_name: size.name,
//       product: product._id,
//     });
//     await orderDetail.save();

//     // Decrease product quantity
//     product.quantity -= quantity;
//     product.sold += quantity;
//     await product.save();

//     // Return success response
//     res
//       .status(201)
//       .json({ message: "Order created successfully", order_id: newOrder._id });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({
//       message: `An error occurred while creating the order: ${error.message}`,
//     });
//   }
// }

// // API to update order status
// exports.updateOrderStatus = async (req, res) => {
//   const { order_id, status } = req.body;

//   try {
//     // Check if the provided status is valid
//     const validStatuses = ["pending", "completed", "canceled"];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ message: "Invalid order status" });
//     }

//     // Find the order by order_id
//     const order = await Order.findById(order_id);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Update the order status
//     order.status = status;
//     await order.save();

//     // Send a success response
//     res
//       .status(200)
//       .json({ message: "Order status updated successfully", order });
//   } catch (error) {
//     console.error("Error updating order status:", error);
//     res
//       .status(500)
//       .json({
//         message: `An error occurred while updating the order status: ${error.message}`,
//       });
//   }
// };

// // Controller to get user's order history
// exports.getUserOrderHistory = async (req, res) => {
//   const { user_id } = req.params; // Access user_id from route parameters

//   try {
//     // Fetch orders by user_id and populate related fields
//     const orders = await Order.find({ user_id }).populate(
//       "payment_id voucher_id"
//     );

//     if (!orders || orders.length === 0) {
//       return res.status(404).json({ message: "No orders found for this user" });
//     }

//     // Fetch order details for each order
//     const ordersWithDetails = await Promise.all(
//       orders.map(async (order) => {
//         const orderDetails = await OrderDetail.find({
//           order_id: order._id,
//         }).populate("product size_id");
//         return {
//           order,
//           orderDetails,
//         };
//       })
//     );

//     res
//       .status(200)
//       .json({
//         message: "User order history retrieved successfully",
//         orders: ordersWithDetails,
//       });
//   } catch (error) {
//     console.error("Error fetching user order history:", error);
//     res
//       .status(500)
//       .json({
//         message: `An error occurred while fetching the order history: ${error.message}`,
//       });
//   }
// };

// // API to cancel an order
// exports.cancelOrder = async (req, res) => {
//   const { order_id } = req.params; // Get order_id from route parameters

//   try {
//     // Find the order by ID
//     const order = await Order.findById(order_id);

//     // Check if the order exists
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Check if the order is already canceled
//     if (order.status === "canceled") {
//       return res.status(400).json({ message: "Order is already canceled" });
//     }

//     // Update the order status to "canceled"
//     order.status = "canceled";
//     await order.save(); // Save the updated order

//     // Return a success response
//     res.status(200).json({ message: "Order canceled successfully", order });
//   } catch (error) {
//     console.error("Error canceling order:", error);
//     res
//       .status(500)
//       .json({
//         message: `An error occurred while canceling the order: ${error.message}`,
//       });
//   }
// };

// // API to get order details by order ID
// exports.getOrderDetails = async (req, res) => {
//   const { order_id } = req.params; // Get order_id from route parameters

//   try {
//     // Find the order by ID and populate related fields
//     const order = await Order.findById(order_id).populate(
//       "payment_id voucher_id user_id"
//     );

//     // Check if the order exists
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Fetch the order details for the specified order
//     const orderDetails = await OrderDetail.find({ order_id }).populate(
//       "product size_id"
//     );

//     // Return the order and its details
//     res.status(200).json({
//       message: "Order details retrieved successfully",
//       order,
//       orderDetails,
//     });
//   } catch (error) {
//     console.error("Error fetching order details:", error);
//     res
//       .status(500)
//       .json({
//         message: `An error occurred while fetching order details: ${error.message}`,
//       });
//   }
// };

// // API to get the current status of an order by order ID
// exports.getOrderStatus = async (req, res) => {
//   const { order_id } = req.params; // Get order_id from route parameters

//   try {
//     // Find the order by ID
//     const order = await Order.findById(order_id);

//     // Check if the order exists
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Return the current status of the order
//     res.status(200).json({
//       message: "Order status retrieved successfully",
//       order_id: order._id,
//       status: order.status,
//     });
//   } catch (error) {
//     console.error("Error fetching order status:", error);
//     res
//       .status(500)
//       .json({
//         message: `An error occurred while fetching order status: ${error.message}`,
//       });
//   }
// };

// // API to create a return request for an order
// exports.createReturnRequest = async (req, res) => {
//   const { order_id } = req.params;
//   const { reason } = req.body;

//   try {
//     // Find the order by ID
//     const order = await Order.findById(order_id);

//     // Check if the order exists
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Check if the order has already been canceled or refunded
//     if (order.status === "canceled") {
//       return res
//         .status(400)
//         .json({ message: "Cannot request a refund for a canceled order." });
//     }

//     // Check if a return request has already been made
//     if (order.refund && order.refund.status !== "pending") {
//       return res
//         .status(400)
//         .json({
//           message: "A return request has already been made for this order.",
//         });
//     }

//     // Update the refund request details in the order
//     order.refund = {
//       reason: reason || "No reason provided",
//       status: "pending",
//       requestDate: Date.now(),
//     };

//     // Save the updated order
//     await order.save();

//     // Return a success response
//     res.status(200).json({
//       message: "Return request created successfully",
//       order,
//     });
//   } catch (error) {
//     console.error("Error creating return request:", error);
//     res
//       .status(500)
//       .json({
//         message: `An error occurred while creating the return request: ${error.message}`,
//       });
//   }
// };

// // API to get all return requests
// exports.getAllReturnRequests = async (req, res) => {
//   try {
//     // Find all orders with a refund request, excluding orders with status "canceled"
//     const returnRequests = await Order.find({
//       "refund.status": { $exists: true },
//       status: { $ne: "canceled" }, // Exclude orders with status "canceled"
//     });

//     // Check if there are any return requests
//     if (returnRequests.length === 0) {
//       return res.status(404).json({ message: "No return requests found" });
//     }

//     // Return the list of return requests
//     res.status(200).json({
//       message: "Return requests retrieved successfully",
//       returnRequests,
//     });
//   } catch (error) {
//     console.error("Error fetching return requests:", error);
//     res
//       .status(500)
//       .json({
//         message: `An error occurred while fetching return requests: ${error.message}`,
//       });
//   }
// };

// // API to get completed orders for a specific user
// exports.getCompletedOrdersByUser = async (req, res) => {
//   const { user_id } = req.params;

//   try {
//     // Find completed orders for the given user
//     const completedOrders = await Order.find({
//       user_id: user_id, // Filter by user ID
//       status: "completed", // Only get completed orders
//     });

//     // Check if there are any completed orders
//     if (completedOrders.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No completed orders found for this user" });
//     }

//     // Return the list of completed orders
//     res.status(200).json({
//       message: "Completed orders retrieved successfully",
//       completedOrders,
//     });
//   } catch (error) {
//     console.error("Error fetching completed orders:", error);
//     res.status(500).json({
//       message: `An error occurred while fetching completed orders: ${error.message}`,
//     });
//   }
// };

// // API to get a list of all orders
// exports.getAllOrders = async (req, res) => {
//   try {
//     // Find all orders in the database
//     const orders = await Order.find();

//     // Check if any orders exist
//     if (orders.length === 0) {
//       return res.status(404).json({ message: "No orders found" });
//     }

//     // Return the list of all orders
//     res.status(200).json({
//       message: "Orders retrieved successfully",
//       orders,
//     });
//   } catch (error) {
//     console.error("Error fetching all orders:", error);
//     res.status(500).json({
//       message: `An error occurred while fetching all orders: ${error.message}`,
//     });
//   }
// };

// // API to get pending orders for a specific user
// exports.getPendingOrdersByUser = async (req, res) => {
//   const { user_id } = req.params; // User ID from request parameters

//   try {
//     // Find pending orders for the given user
//     const pendingOrders = await Order.find({
//       user_id: user_id, // Filter by user ID
//       status: "pending", // Only get pending orders
//     });

//     // Check if there are any pending orders
//     if (pendingOrders.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No pending orders found for this user" });
//     }

//     // Return the list of pending orders
//     res.status(200).json({
//       message: "Pending orders retrieved successfully",
//       pendingOrders,
//     });
//   } catch (error) {
//     console.error("Error fetching pending orders:", error);
//     res.status(500).json({
//       message: `An error occurred while fetching pending orders: ${error.message}`,
//     });
//   }
// };

// // API to get a list of canceled orders
// exports.getCanceledOrders = async (req, res) => {
//   try {
//     // Find all canceled orders
//     const canceledOrders = await Order.find({
//       status: "canceled", // Only get orders with status 'canceled'
//     });

//     // Check if there are any canceled orders
//     if (canceledOrders.length === 0) {
//       return res.status(404).json({ message: "No canceled orders found" });
//     }

//     // Return the list of canceled orders
//     res.status(200).json({
//       message: "Canceled orders retrieved successfully",
//       canceledOrders,
//     });
//   } catch (error) {
//     console.error("Error fetching canceled orders:", error);
//     res.status(500).json({
//       message: `An error occurred while fetching canceled orders: ${error.message}`,
//     });
//   }
// };

// // API to get a list of completed orders
// exports.getCompletedOrders = async (req, res) => {
//   try {
//     // Find all orders with status 'completed'
//     const completedOrders = await Order.find({
//       status: "completed", // Only get orders with status 'completed'
//     });

//     // Check if there are any completed orders
//     if (completedOrders.length === 0) {
//       return res.status(404).json({ message: "No completed orders found" });
//     }

//     // Return the list of completed orders
//     res.status(200).json({
//       message: "Completed orders retrieved successfully",
//       completedOrders,
//     });
//   } catch (error) {
//     console.error("Error fetching completed orders:", error);
//     res.status(500).json({
//       message: `An error occurred while fetching completed orders: ${error.message}`,
//     });
//   }
// };
