const Order = require("../models/orderModel");
const OrderDetail = require("../models/orderDetailModel");
const Payment = require("../models/paymentModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModels");
const Ship = require("../models/shippingModel");
const axios = require("axios");
const crypto = require("crypto");
const { createNotification } = require("../controllers/notificationController");

exports.getOrderDetail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user_id: userId })
      .populate("shipping_id", "status")
      .populate("payment_id.payment_method", "payment_method")
      .populate("orderDetails", "product");

    const payment = await Payment.findById(order.payment_id).populate(
      "payment_method_id",
      "payment_method"
    );

    const ship = await Ship.findById(order.shipping_id);

    const orderDetails = {
      orderCode: order._id,
      products: order.orderDetails,
      total_price: order.total_price,
      payment_method: payment.payment_method_id.payment_method,
      receiver: order.receiver,
      receiverPhone: order.receiverPhone,
      address: order.address,
      statusShip: order.status,
      shipCost: ship.cost,
      // voucherPrice: order.voucher_id.discount_value,
      orderStatus: order.status,
      points: order.points,
      timestamps: {},
    };

    if (order.timestamps.placedAt) {
      orderDetails.timestamps.placedAt = order.timestamps.placedAt;
    }
    if (order.timestamps.shippedAt) {
      orderDetails.timestamps.shippedAt = order.timestamps.shippedAt;
    }
    if (order.timestamps.deliveredAt) {
      orderDetails.timestamps.deliveredAt = order.timestamps.deliveredAt;
    }
    if (order.timestamps.completedAt) {
      orderDetails.timestamps.completedAt = order.timestamps.completedAt;
    }
    if (order.timestamps.cancelledAt) {
      orderDetails.timestamps.cancelledAt = order.timestamps.cancelledAt;
    }

    console.log("orderDetails========> ", orderDetails);

    return res.status(200).json({ status: true, data: orderDetails });
  } catch (error) {
    console.log("create new order error: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

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
      voucher_id: voucher_id || null,
      shipping_id,
      total_price,
      receiver,
      receiverPhone,
      address,
      timestamps: {
        placedAt: Date.now(),
        paidAt: null,
        shippedAt: null,
        deliveredAt: null,
        completedAt: null,
        cancelledAt: null,
      },
      updateAt: Date.now(),
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
        product: {
          id: product._id,
          pd_image: product.assets,
          name: product.name,
          size_name: product.size_name,
          price: product.price,
          pd_quantity: product.quantity,
          size_id: product.size_id,
        },
      });
    });

    console.log("Order Details:", orderDetails);
    try {
      await OrderDetail.insertMany(orderDetails);
    } catch (err) {
      console.error("Error saving order details:", err);
      return res
        .status(400)
        .json({ status: false, message: "Failed to save order details." });
    }

    // Luu vao order
    savedOrder.orderDetails = orderDetails.map((detail) => detail._id);
    await savedOrder.save();

    // Xóa sản phẩm trong giỏ hàng sau khi tạo đơn hàng thành công
    await Cart.deleteMany({
      user_id,
      size_id: { $in: products.map((product) => product.size_id) },
      product_id: { $in: products.map((product) => product._id) },
    });

    // Cập nhật số lượng sản phẩm theo size trong kho
    for (const product of products) {
      const updatedProduct = await Product.updateOne(
        {
          _id: product._id, // Kiểm tra ID sản phẩm
          "size.sizeId": product.size_id, // Kiểm tra sizeId trong sản phẩm
        },
        {
          $inc: { "size.$.quantity": -product.quantity }, // trừ số lượng size tương tương ứng id
        }
      );

      // Khôgn tìm thấy
      if (updatedProduct.matchedCount === 0) {
        console.warn(
          `Không tìm thấy sản phẩm với _id: ${product._id} và sizeId: ${product.size_id}`
        );
      }
    }

    createNotification(
      savedOrder._id,
      `đơn hàng của bạn đã được tạo và đang chờ người bán xác nhận`
    );

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
    });

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

// API để lấy đơn hàng với trạng thái "pending"
exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: "pending",
      user_id: req.user._id,
    });

    const orderIds = orders.map((order) => order._id);
    const orderDetails = await OrderDetail.find({
      order_id: { $in: orderIds },
    }).populate("product.id");

    const ordersWithDetails = orders.map((order) => {
      const details = orderDetails.filter((detail) =>
        detail.order_id.equals(order._id)
      );
      return { ...order.toObject(), orderDetails: details };
    });

    return res.status(200).json({ status: true, data: ordersWithDetails });
  } catch (error) {
    console.log("Error fetching pending orders: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

// API để lấy đơn hàng với trạng thái "processing"
exports.getProcessingOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ["processing", "delivered"] },
      user_id: req.user._id,
    }).sort({ updateAt: -1 });

    const orderIds = orders.map((order) => order._id);
    const orderDetails = await OrderDetail.find({
      order_id: { $in: orderIds },
    }).populate("product.id");

    const ordersWithDetails = orders.map((order) => {
      const details = orderDetails.filter((detail) =>
        detail.order_id.equals(order._id)
      );
      return { ...order.toObject(), orderDetails: details };
    });

    return res.status(200).json({ status: true, data: ordersWithDetails });
  } catch (error) {
    console.log("Error fetching processing orders: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

// API để lấy đơn hàng với trạng thái "completed"
exports.getCompletedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: "completed",
      user_id: req.user._id,
    }).sort({ updateAt: -1 });

    const orderIds = orders.map((order) => order._id);
    const orderDetails = await OrderDetail.find({
      order_id: { $in: orderIds },
    }).populate("product.id");

    const ordersWithDetails = orders.map((order) => {
      const details = orderDetails.filter((detail) =>
        detail.order_id.equals(order._id)
      );
      return { ...order.toObject(), orderDetails: details };
    });

    return res.status(200).json({ status: true, data: ordersWithDetails });
  } catch (error) {
    console.log("Error fetching completed orders: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

// API để lấy đơn hàng với trạng thái "cancelled"
exports.getCancelledOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: "cancelled",
      user_id: req.user._id,
    }).sort({ updateAt: -1 });
    
    const orderIds = orders.map((order) => order._id);
    const orderDetails = await OrderDetail.find({
      order_id: { $in: orderIds },
    }).populate("product.id");

    const ordersWithDetails = orders.map((order) => {
      const details = orderDetails.filter((detail) =>
        detail.order_id.equals(order._id)
      );
      return { ...order.toObject(), orderDetails: details };
    });

    return res.status(200).json({ status: true, data: ordersWithDetails });
  } catch (error) {
    console.log("Error fetching cancelled orders: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

// API để lấy đơn hàng với trạng thái "refunded"
exports.getRefundedOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: "refunded",
      user_id: req.user._id,
      "returnRequest.status": { $exists: true, $ne: null },
    }).sort({ "returnRequest.requestDate": -1 });
    // .sort({ updateAt: -1 });

    const orderIds = orders.map((order) => order._id);
    const orderDetails = await OrderDetail.find({
      order_id: { $in: orderIds },
    }).populate("product.id");

    const ordersWithDetails = orders.map((order) => {
      const details = orderDetails.filter((detail) =>
        detail.order_id.equals(order._id)
      );
      return { ...order.toObject(), orderDetails: details };
    });

    return res.status(200).json({ status: true, data: ordersWithDetails });
  } catch (error) {
    console.log("Error fetching refunded orders: ", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error", error: error.message });
  }
};

exports.getAllOrdersForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, filterStatus = "all" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let statusCondition = {};
    let returnRequestCondition = {};
    if (filterStatus === "all") {
      statusCondition = {};
    } else if (filterStatus === "return-pending") {
      returnRequestCondition = { "returnRequest.status": "pending" }; // Lọc status hoàn trả đang chờ
    } else if (filterStatus === "return-accepted") {
      returnRequestCondition = { "returnRequest.status": "accepted" }; // Lọc status hoàn trả đã chấp nhận
    } else if (filterStatus === "return-rejected") {
      returnRequestCondition = { "returnRequest.status": "rejected" }; // Lọc status hoàn trả bị từ chối
    } else if (filterStatus === "return-refunded") {
      returnRequestCondition = {
        status: "refunded",
        "returnRequest.status": "refunded",
      }; // Lọc status hoàn trả đã hoàn tiền
    } else {
      // Lọc trạng thái đơn hàng
      statusCondition = { status: filterStatus };
    }

    const totalOrders = await Order.countDocuments(statusCondition);

    const pendingOrders = await Order.find({
      status: "pending",
    });

    const processingOrder = await Order.find({
      status: "processing",
    }).countDocuments();

    const completedOrder = await Order.find({
      status: "completed",
    }).countDocuments();

    const ordersCancel = await Order.find({
      status: "cancelled",
    });

    const refundedOrder = await Order.find({
      "returnRequest.status": "pending",
    });

    const orders = await Order.find({
      ...statusCondition,
      ...returnRequestCondition,
    })
      .populate("user_id", "username email")
      .populate({
        path: "payment_id",
        populate: {
          path: "payment_method_id",
          model: "paymentMethod",
        },
      })
      .populate(
        "voucher_id",
        "discount_value voucher_name min_order_value max_discount_value"
      )
      .populate("shipping_id", "name cost createdAt updatedAt")
      .populate({
        path: "orderDetails",
        select:
          "product.id product.name product.size_name product.price product.pd_image product.pd_quantity",
      })
      .sort({ createAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      status: true,
      data: orders,
      totalPages,
      currentPage: parseInt(page),
      limit: parseInt(limit),
      processingOrder,
      completedOrder,
      refundedOrder,
      pendingOrders,
      ordersCancel,
    });
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

    if (order.status !== "completed" && order.status !== "delivered") {
      return res.status(400).json({
        status: false,
        message: "Only completed orders can be returned!",
      });
    }

    order.status = "processing";
    order.returnRequest = {
      reason,
      requestDate: Date.now(),
      status: "pending",
    };
    order.updateAt = Date.now();
    order.timestamps.refundedAt = Date.now();

    const result = await order.save();
    return res.status(200).json({
      status: true,
      message: "Return request submitted successfully!",
      data: result,
    });
  } catch (error) {
    console.log("Return error: ", error);
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
    order.updateAt = Date.now();
    order.returnRequest.responseDate = Date.now();

    if (returnStatus === "accepted") {
      console.log("Yêu cầu hoàn hàng của bạn đã được chấp nhận :)");

      await createNotification(
        order._id,
        `Yêu cầu hoàn hàng của bạn đã được chấp nhận :)`
      );
      order.status = "refunded";
    } else {
      console.log(
        `Tiếc quá. Yêu cầu hoàn hàng của bạn đã bị từ chối vì lý do không hợp lý :)`
      );

      await createNotification(
        order._id,
        `Tiếc quá. Yêu cầu hoàn hàng của bạn đã bị từ chối vì lý do không hợp lý :)`
      );
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
    const user = req.user;
    const order = req.order;

    if (order.status !== "pending") {
      return res.status(400).json({
        status: false,
        message: "Only pending orders can be cancelled!",
      });
    }

    order.status = "cancelled";
    order.canceller = user.name;
    order.updateAt = Date.now();
    order.timestamps.cancelledAt = Date.now();

    // Cộng lại sản phẩm vào kho
    const orderDetails = await OrderDetail.find({ order_id: order._id });
    for (const detail of orderDetails) {
      await Product.updateOne(
        { _id: detail.product.id, "size.sizeId": detail.product.size_id },
        { $inc: { "size.$.quantity": detail.product.pd_quantity } }
      );
    }

    const result = await order.save();
    if (!result) {
      return res
        .status(400)
        .json({ status: false, mesage: "Order cannot be cancelled" });
    }

    const detailOrder = await order.populate(
      "payment_id.payment_method_id",
      "payment_method"
    );

    // Xử lý hoàn tiền nếu đơn hàng đã thanh toán
    // if (order.payment_id && order.payment_id.status === "completed") {
    //   // Refund using ZaloPay
    //   if (
    //     detailOrder.payment_id.payment_method_id.payment_method === "Zalo Pay"
    //   ) {
    //     const refundResponse = await refundZaloPay(order, order.total_price);
    //     if (refundResponse.return_code !== 1) {
    //       return res.status(500).json({
    //         message: "Refund failed",
    //         error: refundResponse.return_message,
    //       });
    //     }

    //     // Cập nhật trạng thái hoàn tiền
    //     order.payment_id.status = "refunded";
    //     await order.payment_id.save();

    //     // Cập nhật lịch sử hoàn tiền
    //     await updatePaymentHistory(
    //       order.user_id,
    //       "Refund for order",
    //       order.total_price
    //     );
    //   } else if (order.payment_id.method === "Thanh toán khi nhận hàng") {
    //     order.payment_id.status = "completed";
    //     await order.payment_id.save();
    //   }
    // }

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

const config = {
  app_id: "2554",
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  refund_url: "https://sb-openapi.zalopay.vn/v2/refund",
};

async function refundZaloPay(order, refundAmount) {
  try {
    const detailOrder = await order.populate(
      "payment_id.payment_method_id",
      "payment_method transaction_id"
    );
    const timestamp = Date.now();
    const refundId = `refund_${order._id}_${timestamp}`;

    // Tạo data cần thiết cho request
    const requestData = {
      app_id: config.app_id,
      // Mã giao dịch ZaloPay bạn nhận được khi thanh toán
      zp_trans_id: detailOrder.payment_id.payment_method_id.transaction_id,
      amount: refundAmount,
      description: `Refund for order #${order._id}`,
      refund_id: refundId,
      timestamp: timestamp,
    };

    // Tạo checksum để bảo mật
    const checksumString = `${requestData.app_id}|${requestData.zp_trans_id}|${requestData.amount}|${requestData.timestamp}|${config.key1}`;
    const checksum = crypto
      .createHmac("sha256", config.key1)
      .update(checksumString)
      .digest("hex");

    // Thêm checksum vào request
    requestData.mac = checksum;

    // Gửi yêu cầu hoàn tiền đến ZaloPay
    const response = await axios.post(config.refund_url, requestData);

    if (response.data.return_code === 1) {
      console.log("Refund successful:", response.data);
      return response.data;
    } else {
      console.error("Refund failed:", response.data.return_message);
      throw new Error(response.data.return_message);
    }
  } catch (error) {
    console.error("Error processing refund:", error);
    throw error;
  }
}

exports.confirmOrder = async (req, res) => {
  try {
    const order = req.order;
    const orderId = req.order._id;
    const { status } = req.body;

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    const validStatuses = ["processing", "delivered", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status provided." });
    }

    const updateFields = { status, updateAt: Date.now() };
    if (status === "processing") {
      await createNotification(
        orderId,
        `Đơn hàng của bạn đã được xác nhận và đang trên đường vận chuyển đến bạn`
      );
      updateFields["timestamps.shippedAt"] = Date.now();
    } else if (status === "delivered") {
      await createNotification(
        orderId,
        `Đơn hàng của bạn đã được giao thành công`
      );
      updateFields["timestamps.deliveredAt"] = Date.now();

      // Cập nhật số lượng bán ra
      const orderDetails = await OrderDetail.find({
        order_id: orderId,
      }).populate("product.id");

      for (const detail of orderDetails) {
        const product = await Product.findById(detail.product.id);
        if (product) {
          product.sold += detail.product.pd_quantity;
          await product.save();
        }
      }
    } else if (status === "completed") {
      await createNotification(orderId, `Đơn hàng được xác nhận thành công`);
      updateFields["timestamps.completedAt"] = Date.now();
    } else if (status === "cancelled") {
      await createNotification(orderId, `Đơn hàng của bạn đã được huỷ`);
      updateFields["timestamps.cancelledAt"] = Date.now();
      updateFields["canceller"] = "Shop";

      // Cập nhật lại số lượng sản phẩm vào kho
      const orderDetails = await OrderDetail.find({
        order_id: orderId,
      }).populate("product.id");
      for (const detail of orderDetails) {
        const product = await Product.findById(detail.product.id);
        if (product) {
          // Tìm size sản phẩm và cập nhật số lượng
          const size = product.size.find(
            (s) => s.sizeId.toString() === detail.product.size_id.toString()
          );
          if (size) {
            size.quantity += detail.product.pd_quantity;
          }
          await product.save();
        }
      }
    }

    const updateOrder = await Order.findByIdAndUpdate(
      { _id: orderId },
      updateFields,
      {
        new: true,
      }
    );

    return res.status(200).json({
      status: true,
      message: "Order status updated successfully.",
      data: updateOrder,
    });
  } catch (error) {
    console.error("Error confirming order:", error);
    return res.status(500).json({
      status: false,
      error: "An error occurred while confirming the order.",
    });
  }
};

exports.getOrdersForBottomSheet = async (req, res) => {
  try {
    const user = req.user;

    const orders = await Order.find({ user_id: user._id });

    const promiseOrders = orders.map(async (order) => {
      const orderDetails = await OrderDetail.find({ order_id: order._id });
      return {
        order,
        orderDetails,
      };
    });
    const returnedOrder = await Promise.all(promiseOrders);

    return res.status(200).json({
      status: true,
      message: "get ordeers successfully!",
      data: returnedOrder,
    });
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.handleReturnOrder = async (req, res) => {
  try {
    const order = req.order;

    order.status = "refunded";
    order.returnRequest.status = "refunded";
    order.updateAt = Date.now();
    order.timestamps.completedRefundedAt = Date.now();

    const result = await order.save();
    if (!result) {
      return res
        .status(400)
        .json({ status: false, message: "Error updating order" });
    }

    // Cập nhật số lượng sản phẩm
    for (const orderDetail of order.orderDetails) {
      const product = await Product.findById(orderDetail.productId);
      if (product) {
        // Tăng số lượng trong kho và giảm số lượng đã bán
        for (const size of product.size) {
          if (size.sizeId.toString() === orderDetail.sizeId.toString()) {
            size.quantity += orderDetail.quantity;
            product.sold -= orderDetail.quantity;
            break;
          }
        }
        await product.save();
      }
    }

    return res
      .status(200)
      .json({ status: true, message: "success", data: result });
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
