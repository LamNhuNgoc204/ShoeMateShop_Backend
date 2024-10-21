const Order = require("../models/orderModel");
const Payment = require("../models/paymentModel");

const axios = require("axios").default;
const CryptoJS = require("crypto-js");
const moment = require("moment");
const qs = require("qs");

// ZALO PAY
const config = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

exports.paymentFunction = async (req, res) => {
  const { username, amount } = req.body;
  const embed_data = "{}";
  const items = "[{}]";

  const transID = Math.floor(Math.random() * 1000000);
  const order = {
    app_id: config.app_id,
    app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
    app_user: username,
    app_time: Date.now(), // miliseconds
    item: items,
    embed_data: embed_data,
    amount: amount,
    description: `ShoeMate - Payment for the order #${transID}`,
    bank_code: "",
    callback_url: "localhost://3000/payment/callbaclk",
  };

  // appid|app_trans_id|appuser|amount|apptime|embeddata|item
  const data =
    config.app_id +
    "|" +
    order.app_trans_id +
    "|" +
    order.app_user +
    "|" +
    order.amount +
    "|" +
    order.app_time +
    "|" +
    order.embed_data +
    "|" +
    order.item;
  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  try {
    const response = await axios.post(config.endpoint, null, { params: order });
    console.log(response.data);

    return res.status(200).json({ status: true, data: response.data });
  } catch (error) {
    console.log(err);
    res.status(500).send("Error creating ZaloPay order");
  }
};

//Thong bao sau thanh toan thanh cong
exports.notifycation = async (req, res) => {
  let result = {};

  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log("mac =", mac);

    // kiểm tra callback hợp lệ (đến từ ZaloPay server)
    if (reqMac !== mac) {
      // callback không hợp lệ
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng
      let dataJson = JSON.parse(dataStr, config.key2);
      console.log(
        "update order's status = success where app_trans_id =",
        dataJson["app_trans_id"]
      );

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message;
  }

  // thông báo kết quả cho ZaloPay server
  res.json(result);
};

exports.orderStatus = async (req, res) => {
  const app_trans_id = req.params.app_trans_id;
  let postData = {
    app_id: config.app_id,
    app_trans_id: app_trans_id,
  };

  let data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1; // appid|app_trans_id|key1
  postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  let postConfig = {
    method: "post",
    url: "https://sb-openapi.zalopay.vn/v2/query",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: qs.stringify(postData),
  };

  axios(postConfig)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      return res.status(200).json({ data: response.data });
    })
    .catch(function (error) {
      console.log(error);
    });
};

// THEM PHUONG THUC THANH TOAN: name, image
exports.createNewMethod = async (req, res) => {
  try {
    const { payment_method, image } = req.body;
    if (!payment_method || !image) {
      return res
        .status(400)
        .json({ status: false, message: "All field is required" });
    }

    const checkpayment_method = await Payment.findOne({
      payment_method: payment_method,
    });
    if (checkpayment_method) {
      return res
        .status(400)
        .json({ status: false, message: "This method is exits" });
    }

    const payment = new Payment({ payment_method, image });
    await payment.save();

    return res.status(200).json({ status: true, data: payment });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getAllPaymentMethod = async (req, res) => {
  try {
    const payments = await Payment.find();
    return res.status(200).json({ status: true, data: payments });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

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
      return res
        .status(400)
        .json({ message: "Payment has already been confirmed" });
    }

    // Update payment status to 'completed'
    payment.status = "completed";
    await payment.save();

    // Update order status to 'completed'
    order.status = "completed";
    await order.save();

    // Respond with success message
    res
      .status(200)
      .json({ message: "Payment confirmed and order completed successfully" });
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
      return res
        .status(400)
        .json({ message: "Order is already canceled or refunded" });
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
    res
      .status(200)
      .json({
        message: "Refund request processed successfully",
        order_id: order._id,
      });
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
    res
      .status(201)
      .json({
        message: "Payment information saved and updated successfully",
        payment_id: payment._id,
      });
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
      const payment = await Payment.findById(payment_id).populate("order_id"); // Có thể populate để lấy thông tin đơn hàng

      // Kiểm tra xem bản ghi thanh toán có tồn tại không
      if (!payment) {
        return res.status(404).json({ message: "Payment not found." });
      }

      // Trả về thông tin thanh toán
      return res
        .status(200)
        .json({
          message: "Payment information retrieved successfully",
          payment,
        });
    } else {
      // Nếu không có payment_id, lấy tất cả các bản ghi thanh toán
      const payments = await Payment.find().populate("order_id"); // Có thể populate để lấy thông tin đơn hàng
      return res
        .status(200)
        .json({ message: "Payments retrieved successfully", payments });
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
      return res
        .status(404)
        .json({ message: "Payment record not found for this order." });
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
    res
      .status(200)
      .json({ message: "Payment status updated successfully.", payment });
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
      return res
        .status(404)
        .json({ message: "No payments found with the provided status." });
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
    res
      .status(200)
      .json({
        message:
          "Payment canceled successfully, and order status updated to pending.",
        payment,
      });
  } catch (error) {
    console.error("Error canceling payment and updating order:", error);
    res.status(500).json({
      message: `An error occurred while canceling the payment and updating the order: ${error.message}`,
    });
  }
};
