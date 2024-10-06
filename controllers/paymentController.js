const Order = require("../models/orderModel");
const Payment = require("../models/paymentModel");

// API Confirm successful payment
exports.confirmPayment = async (req, res) => {
    const { order_id, payment_id } = req.body;

    try {
        // Find the order by ID
        const order = await Order.findById(order_id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Find the payment by ID
        const payment = await Payment.findById(payment_id);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        // Check if the payment is already confirmed
        if (payment.status === "completed") {
            return res.status(400).json({ message: "Payment has already been confirmed" });
        }

        // Update payment status to 'completed'
        payment.status = "completed";
        await payment.save();

        // Update order status to 'completed'
        order.status = "completed";
        await order.save();

        // Respond with success message
        res.status(200).json({ message: "Payment confirmed and order completed successfully" });
    } catch (error) {
        console.error("Error confirming payment:", error);
        res.status(500).json({
            message: `An error occurred while confirming the payment: ${error.message}`,
        });
    }
};

//API Process refund for an order
exports.processRefund = async (req, res) => {
    const { order_id, reason } = req.body;

    try {
        // Find the order by ID
        const order = await Order.findById(order_id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if the order is already refunded or canceled
        if (order.status === "canceled" || order.refund.status === "confirmed") {
            return res.status(400).json({ message: "Order is already canceled or refunded" });
        }

        // Update order status to 'canceled'
        order.status = "canceled";

        // Create a refund request
        order.refund = {
            reason,
            status: "pending",
            requestDate: new Date(),
            createdAt: new Date(),
        };

        // Update the order in the database
        await order.save();

        // Update payment status (assuming the payment is stored with reference)
        const payment = await Payment.findById(order.payment_id);
        if (payment) {
            payment.status = "failed"; // or any status representing a refund
            await payment.save();
        }

        // Respond with success message
        res.status(200).json({ message: "Refund request processed successfully", order_id: order._id });
    } catch (error) {
        console.error("Error processing refund:", error);
        res.status(500).json({
            message: `An error occurred while processing the refund: ${error.message}`,
        });
    }
};

//API Save payment information and update payment record
exports.savePaymentInfo = async (req, res) => {
  const { order_id, payment_method } = req.body;

  try {
    // Tìm đơn hàng theo ID
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Lấy total_price từ đơn hàng
    const amount = order.total_price; // Lấy giá trị total_price làm amount

    // Tìm bản ghi thanh toán dựa trên order_id
    let payment = await Payment.findOne({ order_id: order._id });
    if (!payment) {
      // Nếu không có bản ghi thanh toán, tạo mới
      payment = new Payment({
        order_id: order._id,
        payment_method,
        status: "completed", 
        amount, // Lưu số tiền thanh toán
      });
    } else {
      // Cập nhật thông tin thanh toán nếu đã tồn tại
      payment.payment_method = payment_method;
      payment.amount = amount; // Cập nhật số tiền thanh toán
      payment.status = "completed"; // Hoặc cập nhật trạng thái nếu cần
    }

    // Lưu bản ghi thanh toán
    await payment.save();

    // Cập nhật lại thông tin thanh toán trong đơn hàng
    order.payment_id = payment._id; // Gán payment_id cho đơn hàng
    order.status = "completed"; // Cập nhật trạng thái đơn hàng
    await order.save();

    // Phản hồi thành công
    res.status(201).json({ message: "Payment information saved and updated successfully", payment_id: payment._id });
  } catch (error) {
    console.error("Error saving payment information:", error);
    res.status(500).json({
      message: `An error occurred while saving payment information: ${error.message}`,
    });
  }
};

//API Get all payments or payment by payment_id
exports.getPayments = async (req, res) => {
    const { payment_id } = req.params; // Nhận payment_id từ tham số URL
  
    try {
      if (payment_id) {
        // Nếu payment_id được cung cấp, tìm bản ghi thanh toán theo ID
        const payment = await Payment.findById(payment_id).populate('order_id'); // Có thể populate để lấy thông tin đơn hàng
  
        // Kiểm tra xem bản ghi thanh toán có tồn tại không
        if (!payment) {
          return res.status(404).json({ message: "Payment not found." });
        }
  
        // Trả về thông tin thanh toán
        return res.status(200).json({ message: "Payment information retrieved successfully", payment });
      } else {
        // Nếu không có payment_id, lấy tất cả các bản ghi thanh toán
        const payments = await Payment.find().populate('order_id'); // Có thể populate để lấy thông tin đơn hàng
        return res.status(200).json({ message: "Payments retrieved successfully", payments });
      }
    } catch (error) {
      console.error("Error retrieving payments:", error);
      res.status(500).json({
        message: `An error occurred while retrieving payments: ${error.message}`,
      });
    }
  };

//API Update payment status for an existing order
exports.updatePaymentStatus = async (req, res) => {
  const { order_id, status } = req.body; // Nhận order_id và status từ body

  try {
    // Tìm đơn hàng theo order_id
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Tìm bản ghi thanh toán theo order_id
    const payment = await Payment.findOne({ order_id: order._id });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found for this order." });
    }

    // Cập nhật trạng thái thanh toán
    payment.status = status; // status có thể là "pending", "completed", "failed"
    await payment.save();

    // Cập nhật trạng thái đơn hàng nếu cần
    if (status === "completed") {
      order.status = "completed"; // Hoặc cập nhật trạng thái khác nếu cần
    } else if (status === "failed") {
      order.status = "canceled"; // Hoặc cập nhật trạng thái khác nếu cần
    }
    await order.save();

    // Phản hồi thành công
    res.status(200).json({ message: "Payment status updated successfully.", payment });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      message: `An error occurred while updating payment status: ${error.message}`,
    });
  }
};

// API Get payments by status
exports.getPaymentsByStatus = async (req, res) => {
  const { status } = req.body; // Nhận status từ body

  try {
    // Kiểm tra xem status có hợp lệ hay không
    const validStatuses = ["pending", "completed", "failed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status provided." });
    }

    // Tìm các bản ghi thanh toán theo trạng thái
    const payments = await Payment.find({ status });

    // Kiểm tra nếu không có bản ghi nào
    if (payments.length === 0) {
      return res.status(404).json({ message: "No payments found with the provided status." });
    }

    // Trả về danh sách các bản ghi thanh toán
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error retrieving payments by status:", error);
    res.status(500).json({
      message: `An error occurred while retrieving payments: ${error.message}`,
    });
  }
};

// API Cancel Payment
exports.cancelPayment = async (req, res) => {
  const { payment_id } = req.body; // Nhận payment_id từ body

  try {
    // Tìm thanh toán theo ID
    const payment = await Payment.findById(payment_id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    // Cập nhật trạng thái thanh toán thành "failed" hoặc "canceled"
    payment.status = "failed"; // Hoặc "canceled" tùy thuộc vào yêu cầu
    await payment.save();

    // Cập nhật trạng thái đơn hàng về "pending"
    const order = await Order.findById(payment.order_id);
    if (order) {
      order.status = "pending"; // Đưa đơn hàng về trạng thái chờ
      await order.save();
    } else {
      console.warn("Order not found for the payment, but payment was updated.");
    }

    // Phản hồi thành công
    res.status(200).json({ message: "Payment canceled successfully, and order status updated to pending.", payment });
  } catch (error) {
    console.error("Error canceling payment and updating order:", error);
    res.status(500).json({
      message: `An error occurred while canceling the payment and updating the order: ${error.message}`,
    });
  }
};