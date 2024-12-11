const Order = require("../models/orderModel");
const Payment = require("../models/paymentModel");
const PaymentMethod = require("../models/paymentMethod");
const PaidHistory = require("../models/paidHistoryModel");

exports.getPaymentDefault = async (_, res) => {
  try {
    const data = await PaymentMethod.findOne({ isDefault: true });
    if (data) {
      return res.status(200).json({ status: true, data: data });
    }
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// THEM PHUONG THUC THANH TOAN: name, image
exports.createNewMethod = async (req, res) => {
  try {
    const { payment_method, image, isDefault, isActive } = req.body;
    if (!payment_method || !image) {
      return res
        .status(400)
        .json({ status: false, message: "All field is required" });
    }

    if (isDefault) {
      await PaymentMethod.updateMany({ isDefault: true }, { isDefault: false });
    }

    const checkpayment_method = await PaymentMethod.findOne({
      payment_method: payment_method,
    });
    if (checkpayment_method) {
      return res
        .status(400)
        .json({ status: false, message: "This method is exits" });
    }

    const payment = new PaymentMethod({
      payment_method,
      image,
      isDefault: !!isDefault,
      isActive: isActive,
    });
    await payment.save();

    return res.status(200).json({ status: true, data: payment });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, image, isDefault, isActive } = req.body;

    if (!payment_method || !image) {
      return res.status(400).json({
        status: false,
        message: "Tên phương thức và hình ảnh là bắt buộc.",
      });
    }

    const updatedMethod = await PaymentMethod.findByIdAndUpdate(
      id,
      { payment_method, image, isDefault, isActive },
      { new: true }
    );

    if (!updatedMethod) {
      return res.status(404).json({
        status: false,
        message: "Không tìm thấy phương thức thanh toán.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Cập nhật phương thức thanh toán thành công.",
      data: updatedMethod,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        status: false,
        message: "Trạng thái isActive phải là kiểu boolean.",
      });
    }

    const updatedMethod = await PaymentMethod.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedMethod) {
      return res.status(404).json({
        status: false,
        message: "Không tìm thấy phương thức thanh toán.",
      });
    }

    console.log("updatedMethod========>", updatedMethod);

    return res.status(200).json({
      status: true,
      message: "Cập nhật phương thức thanh toán thành công.",
      data: updatedMethod,
    });
  } catch (error) {
    console.log("error==>", error);

    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getAllPaymentMethod = async (req, res) => {
  try {
    const payments = await PaymentMethod.find({ isActive: true });
    return res.status(200).json({ status: true, data: payments });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getPaymentMethodForWeb = async (req, res) => {
  try {
    const payments = await PaymentMethod.find();
    return res.status(200).json({ status: true, data: payments });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// exports.processPayment = async (req, res) => {
//   try {
//     const order = req.order;
//     const { paymentMethod_id, amount } = req.body;

//     const populatedOrder = await order.populate(
//       "payment_id",
//       "payment_method_id"
//     );

//     if (
//       populatedOrder.payment_id.payment_method_id.toString() !==
//       paymentMethod_id
//     ) {
//       return res.status(400).json({
//         status: false,
//         message: "Invalid payment method for this order",
//       });
//     }

//     const paymentMethod = await PaymentMethod.findById(paymentMethod_id);
//     if (!paymentMethod) {
//       return res.status(404).json({
//         status: false,
//         message: `Payment method with ID ${paymentMethod_id} not found`,
//       });
//     }

//     switch (paymentMethod.payment_method) {
//       case "Thanh toán khi nhận hàng":
//         order.payment_id = await createPayment(order._id, "COD", amount);
//         order.status = "processing";
//         await order.save();
//         return res
//           .status(200)
//           .json({ message: "Order will be paid on delivery", order });

//       case "Zalo Pay":
//         const zaloPayment = await initiateZaloPay(order._id, amount);
//         order.payment_id = zaloPayment._id;
//         await order.save();
//         return res.status(200).json({
//           message: "Redirect to ZaloPay",
//           url: zaloPayment.redirectUrl,
//         });

//       case "Momo":
//         const momoPayment = await initiateMoMo(order._id, amount);
//         order.payment_id = momoPayment._id;
//         await order.save();
//         return res
//           .status(200)
//           .json({ message: "Redirect to MoMo", url: momoPayment.redirectUrl });

//       default:
//         return res.status(400).json({ message: "Invalid payment method" });
//     }
//   } catch (error) {
//     return res.status(500).json({ status: false, message: "Server error" });
//   }
// };

// ZALO PAY
const axios = require("axios").default;
const CryptoJS = require("crypto-js");
const moment = require("moment");
const qs = require("qs");

const config = {
  app_id: "2554",
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
  //https://sb-openapi.zalopay.vn/v2/create
};

exports.Zalopayment = async (req, res) => {
  const { userid, orderId, amount } = req.body;
  // const userid = req.user._id;
  console.log("userid zalo pay", userid);

  const embed_data = JSON.stringify({
    redirecturl: "https://luxury-bunny-3e3183.netlify.app/",
  });
  const items = "[{}]";

  const orderCheck = await Order.findById(orderId).populate(
    "payment_id",
    "transaction_id"
  );

  if (!orderCheck) {
    return res.status(400).json({ status: false, message: "Order not found" });
  }

  const transID = orderId;
  //Math.floor(Math.random() * 1000000);
  const order = {
    app_id: config.app_id,
    app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
    app_user: userid,
    app_time: Date.now(), // miliseconds
    item: items,
    embed_data: embed_data,
    amount: amount,
    description: `ShoeMate - Payment for the order #${transID}`,
    bank_code: "",
    callback_url: "<https://google.com>",
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
  // console.log("order===>", order);

  try {
    const response = await axios.post(config.endpoint, null, { params: order });
    console.log("KẾT QUẢ TRẢ VỀ===>", response.data);

    try {
      await updatePaymentAndOrderStatus(
        orderCheck,
        response.data.transaction_id,
        amount,
        userid
      );
    } catch (error) {
      console.log("Failed to update payment and order status:", error.message);
      return res.status(500).json({
        status: false,
        message: "Failed to update payment and order status.",
        error: error,
      });
    }

    return res.status(200).json({ status: true, data: response.data });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error creating ZaloPay order");
  }
};

async function updatePaymentAndOrderStatus(
  orderCheck,
  transactionId,
  amount,
  userid
) {
  try {
    // Cập nhât transaction ID trong bảng payment
    orderCheck.payment_id.transaction_id = transactionId;

    // Update payment status
    const paymentUpdate = await Payment.findByIdAndUpdate(
      orderCheck.payment_id._id,
      { status: "completed", transaction_id: transactionId },
      { new: true }
    );

    if (!paymentUpdate) {
      throw new Error("Payment not found");
    }

    // Cập nhật trạng thái order to "processing"
    const orderUpdate = await Order.findByIdAndUpdate(
      orderCheck._id,
      { status: "processing" },
      { new: true }
    );

    if (!orderUpdate) {
      throw new Error("Order not found");
    }

    // // Lưu lịch sử thanh toán
    // const user = await userModel.findOne({
    //   _id: new mongoose.Types.ObjectId(userid),
    // });
    // if (user) {
    //   await savePaymentHistory(userid, amount);
    // } else {
    //   console.log("check user before save : ", user);
    // }

    // console.log(
    //   "Payment and order successfully updated:",
    //   paymentUpdate,
    //   orderUpdate
    // );
  } catch (error) {
    console.log("Error updating payment or order:", error.message);
    throw error;
  }
}

// Lưu lịch sử thanh toán
// async function savePaymentHistory(userid, amount) {
//   try {
//     const userIdObj = new mongoose.Types.ObjectId(userid); // Đảm bảo userid là ObjectId
//     const user = await userModel.findOne({ _id: userIdObj });
//     console.log("Searching for user with ID:", userIdObj);
//     // const user = await userModel.findOne({ _id: userid });
//     // console.log("Searching for user with ID:", userid);
//     if (!user) {
//       throw new Error("User not found");
//     }

//     const history = new PaidHistory({
//       user_id: user._id,
//       title: `Payment for order by zalo pay`,
//       money: amount,
//       point: calculatePoints(amount),
//     });

//     await history.save();
//     console.log("Payment history saved:", history);
//   } catch (err) {
//     console.log("Error saving payment history:", err.message);
//   }
// }

// Tính điểm
function calculatePoints(amount) {
  return Math.floor(amount / 100);
}

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

// MOMO
const crypto = require("crypto");
const { log } = require("console");
const userModel = require("../models/userModel");
var accessKey = "F8BBA842ECF85";
var secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";

exports.paymnetMomo = async (req, res) => {
  const { userid, orderId, amount } = req.body;

  var partnerCode = "MOMO";
  var orderInfo = "pay with MoMo";
  var redirectUrl = "";
  var ipnUrl =
    "https://72cc-2405-4802-93f3-ab70-9d52-6883-a556-f78.ngrok-free.app/momo/callback";
  var requestType = "payWithMethod";
  var requestId = orderId;
  var extraData = "";
  var paymentCode =
    "T8Qii53fAXyUftPV3m9ysyRhEanUs9KlOPfHgpMR0ON50U10Bh+vZdpJU7VY4z+Z2y77fJHkoDc69scwwzLuW5MzeUKTwPo3ZMaB29imm6YulqnWfTkgzqRaion+EuD7FN9wZ4aXE1+mRt0gHsU193y+yxtRgpmY7SDMU9hCKoQtYyHsfFR5FUAOAKMdw2fzQqpToei3rnaYvZuYaxolprm9+/+WIETnPUDlxCYOiw7vPeaaYQQH0BF0TxyU3zu36ODx980rJvPAgtJzH1gUrlxcSS1HQeQ9ZaVM1eOK/jl8KJm6ijOwErHGbgf/hVymUQG65rHU2MWz9U8QUjvDWA==";
  var orderGroupId = "";
  var autoCapture = true;
  var lang = "vi";

  var rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;
  //puts raw signature
  console.log("--------------------RAW SIGNATURE----------------");
  console.log(rawSignature);
  //signature
  var signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");
  console.log("--------------------SIGNATURE----------------");
  console.log(signature);

  //json object send to MoMo endpoint
  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: extraData,
    orderGroupId: orderGroupId,
    signature: signature,
  });

  const option = {
    method: "POST",
    url: "https://test-payment.momo.vn/v2/gateway/api/create",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
    data: requestBody,
  };

  let result;
  try {
    result = await axios(option);

    await updatePaymentAndOrderStatus(
      orderId,
      result.data.transactionId,
      amount,
      userid
    );

    return res.status(200).json(result.data);
  } catch (error) {
    console.log("errror ===> ", error);

    return res.status(500).json({ status: false, message: "Server error" });
  }
};

async function updatePaymentAndOrderStatus(
  orderId,
  transactionId,
  amount,
  userid
) {
  try {
    // Find the order by its ID and populate its payment
    const orderCheck = await Order.findById(orderId).populate(
      "payment_id",
      "transaction_id"
    );

    if (!orderCheck) {
      throw new Error("Order not found");
    }

    // Update the transaction ID in payment
    orderCheck.payment_id.transaction_id = transactionId;

    // Update payment status to "completed"
    const paymentUpdate = await Payment.findByIdAndUpdate(
      orderCheck.payment_id._id,
      { status: "completed", transaction_id: transactionId },
      { new: true }
    );

    if (!paymentUpdate) {
      throw new Error("Payment not found");
    }

    // Update order status to "processing"
    const orderUpdate = await Order.findByIdAndUpdate(
      orderCheck._id,
      { status: "processing" },
      { new: true }
    );

    if (!orderUpdate) {
      throw new Error("Order not found");
    }

    // Save the payment history
    await savePaymentHistory(userid, amount);

    console.log(
      "Payment and order successfully updated:",
      paymentUpdate,
      orderUpdate
    );
  } catch (error) {
    console.log("Error updating payment or order:", error.message);
    throw error;
  }
}

// Lưu lịch sử giao dịch
async function savePaymentHistory(userid, amount) {
  try {
    const user = await userModel.findOne({ userid });
    if (!user) {
      throw new Error("User not found");
    }

    const history = new PaidHistory({
      user_id: user._id,
      title: `Payment for order`,
      money: amount,
      point: calculatePoints(amount),
    });

    await history.save();
    console.log("Payment history saved:", history);
  } catch (err) {
    console.log("Error saving payment history:", err.message);
  }
}

// Tính điểm
function calculatePoints(amount) {
  return Math.floor(amount / 100);
}

exports.callback = async (req, res) => {
  console.log("MoMo callback: ");
  console.log(req.body);
  return res.status(200).json(req.body);
};

exports.momoOrderStatus = async (req, res) => {
  var { orderId } = req.body;

  const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=MOMO&requestId=${orderId}`;

  var signature = crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = JSON.stringify({
    partnerCode: "MOMO",
    orderId: orderId,
    requestId: orderId,
    lang: "vi",
    signature: signature,
  });

  let options = {
    method: "POST",
    url: "https://test-payment.momo.vn/v2/gateway/api/query",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
    data: requestBody,
  };

  try {
    const result = await axios(options);
    return res.status(200).json(result.data);
  } catch (error) {
    console.log(error);

    return res.status(500).json(error);
  }
};

// // API Confirm successful payment
// exports.confirmPayment = async (req, res) => {
//   const { order_id, payment_id } = req.body;

//   try {
//     // Find the order by ID
//     const order = await Order.findById(order_id);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Find the payment by ID
//     const payment = await Payment.findById(payment_id);
//     if (!payment) {
//       return res.status(404).json({ message: "Payment not found" });
//     }

//     // Check if the payment is already confirmed
//     if (payment.status === "completed") {
//       return res
//         .status(400)
//         .json({ message: "Payment has already been confirmed" });
//     }

//     // Update payment status to 'completed'
//     payment.status = "completed";
//     await payment.save();

//     // Update order status to 'completed'
//     order.status = "completed";
//     await order.save();

//     // Respond with success message
//     res
//       .status(200)
//       .json({ message: "Payment confirmed and order completed successfully" });
//   } catch (error) {
//     console.error("Error confirming payment:", error);
//     res.status(500).json({
//       message: `An error occurred while confirming the payment: ${error.message}`,
//     });
//   }
// };

// //API Process refund for an order
// exports.processRefund = async (req, res) => {
//   const { order_id, reason } = req.body;

//   try {
//     // Find the order by ID
//     const order = await Order.findById(order_id);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Check if the order is already refunded or canceled
//     if (order.status === "canceled" || order.refund.status === "confirmed") {
//       return res
//         .status(400)
//         .json({ message: "Order is already canceled or refunded" });
//     }

//     // Update order status to 'canceled'
//     order.status = "canceled";

//     // Create a refund request
//     order.refund = {
//       reason,
//       status: "pending",
//       requestDate: new Date(),
//       createdAt: new Date(),
//     };

//     // Update the order in the database
//     await order.save();

//     // Update payment status (assuming the payment is stored with reference)
//     const payment = await Payment.findById(order.payment_id);
//     if (payment) {
//       payment.status = "failed"; // or any status representing a refund
//       await payment.save();
//     }

//     // Respond with success message
//     res.status(200).json({
//       message: "Refund request processed successfully",
//       order_id: order._id,
//     });
//   } catch (error) {
//     console.error("Error processing refund:", error);
//     res.status(500).json({
//       message: `An error occurred while processing the refund: ${error.message}`,
//     });
//   }
// };

// //API Save payment information and update payment record
// exports.savePaymentInfo = async (req, res) => {
//   const { order_id, payment_method } = req.body;

//   try {
//     // Tìm đơn hàng theo ID
//     const order = await Order.findById(order_id);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Lấy total_price từ đơn hàng
//     const amount = order.total_price; // Lấy giá trị total_price làm amount

//     // Tìm bản ghi thanh toán dựa trên order_id
//     let payment = await Payment.findOne({ order_id: order._id });
//     if (!payment) {
//       // Nếu không có bản ghi thanh toán, tạo mới
//       payment = new Payment({
//         order_id: order._id,
//         payment_method,
//         status: "completed",
//         amount, // Lưu số tiền thanh toán
//       });
//     } else {
//       // Cập nhật thông tin thanh toán nếu đã tồn tại
//       payment.payment_method = payment_method;
//       payment.amount = amount; // Cập nhật số tiền thanh toán
//       payment.status = "completed"; // Hoặc cập nhật trạng thái nếu cần
//     }

//     // Lưu bản ghi thanh toán
//     await payment.save();

//     // Cập nhật lại thông tin thanh toán trong đơn hàng
//     order.payment_id = payment._id; // Gán payment_id cho đơn hàng
//     order.status = "completed"; // Cập nhật trạng thái đơn hàng
//     await order.save();

//     // Phản hồi thành công
//     res.status(201).json({
//       message: "Payment information saved and updated successfully",
//       payment_id: payment._id,
//     });
//   } catch (error) {
//     console.error("Error saving payment information:", error);
//     res.status(500).json({
//       message: `An error occurred while saving payment information: ${error.message}`,
//     });
//   }
// };

// //API Get all payments or payment by payment_id
// exports.getPayments = async (req, res) => {
//   const { payment_id } = req.params; // Nhận payment_id từ tham số URL

//   try {
//     if (payment_id) {
//       // Nếu payment_id được cung cấp, tìm bản ghi thanh toán theo ID
//       const payment = await Payment.findById(payment_id).populate("order_id"); // Có thể populate để lấy thông tin đơn hàng

//       // Kiểm tra xem bản ghi thanh toán có tồn tại không
//       if (!payment) {
//         return res.status(404).json({ message: "Payment not found." });
//       }

//       // Trả về thông tin thanh toán
//       return res.status(200).json({
//         message: "Payment information retrieved successfully",
//         payment,
//       });
//     } else {
//       // Nếu không có payment_id, lấy tất cả các bản ghi thanh toán
//       const payments = await Payment.find().populate("order_id"); // Có thể populate để lấy thông tin đơn hàng
//       return res
//         .status(200)
//         .json({ message: "Payments retrieved successfully", payments });
//     }
//   } catch (error) {
//     console.error("Error retrieving payments:", error);
//     res.status(500).json({
//       message: `An error occurred while retrieving payments: ${error.message}`,
//     });
//   }
// };

// //API Update payment status for an existing order
// exports.updatePaymentStatus = async (req, res) => {
//   const { order_id, status } = req.body; // Nhận order_id và status từ body

//   try {
//     // Tìm đơn hàng theo order_id
//     const order = await Order.findById(order_id);
//     if (!order) {
//       return res.status(404).json({ message: "Order not found." });
//     }

//     // Tìm bản ghi thanh toán theo order_id
//     const payment = await Payment.findOne({ order_id: order._id });
//     if (!payment) {
//       return res
//         .status(404)
//         .json({ message: "Payment record not found for this order." });
//     }

//     // Cập nhật trạng thái thanh toán
//     payment.status = status; // status có thể là "pending", "completed", "failed"
//     await payment.save();

//     // Cập nhật trạng thái đơn hàng nếu cần
//     if (status === "completed") {
//       order.status = "completed"; // Hoặc cập nhật trạng thái khác nếu cần
//     } else if (status === "failed") {
//       order.status = "canceled"; // Hoặc cập nhật trạng thái khác nếu cần
//     }
//     await order.save();

//     // Phản hồi thành công
//     res
//       .status(200)
//       .json({ message: "Payment status updated successfully.", payment });
//   } catch (error) {
//     console.error("Error updating payment status:", error);
//     res.status(500).json({
//       message: `An error occurred while updating payment status: ${error.message}`,
//     });
//   }
// };

// // API Get payments by status
// exports.getPaymentsByStatus = async (req, res) => {
//   const { status } = req.body; // Nhận status từ body

//   try {
//     // Kiểm tra xem status có hợp lệ hay không
//     const validStatuses = ["pending", "completed", "failed"];
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ message: "Invalid status provided." });
//     }

//     // Tìm các bản ghi thanh toán theo trạng thái
//     const payments = await Payment.find({ status });

//     // Kiểm tra nếu không có bản ghi nào
//     if (payments.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No payments found with the provided status." });
//     }

//     // Trả về danh sách các bản ghi thanh toán
//     res.status(200).json(payments);
//   } catch (error) {
//     console.error("Error retrieving payments by status:", error);
//     res.status(500).json({
//       message: `An error occurred while retrieving payments: ${error.message}`,
//     });
//   }
// };

// // API Cancel Payment
// exports.cancelPayment = async (req, res) => {
//   const { payment_id } = req.body; // Nhận payment_id từ body

//   try {
//     // Tìm thanh toán theo ID
//     const payment = await Payment.findById(payment_id);
//     if (!payment) {
//       return res.status(404).json({ message: "Payment not found." });
//     }

//     // Cập nhật trạng thái thanh toán thành "failed" hoặc "canceled"
//     payment.status = "failed"; // Hoặc "canceled" tùy thuộc vào yêu cầu
//     await payment.save();

//     // Cập nhật trạng thái đơn hàng về "pending"
//     const order = await Order.findById(payment.order_id);
//     if (order) {
//       order.status = "pending"; // Đưa đơn hàng về trạng thái chờ
//       await order.save();
//     } else {
//       console.warn("Order not found for the payment, but payment was updated.");
//     }

//     // Phản hồi thành công
//     res.status(200).json({
//       message:
//         "Payment canceled successfully, and order status updated to pending.",
//       payment,
//     });
//   } catch (error) {
//     console.error("Error canceling payment and updating order:", error);
//     res.status(500).json({
//       message: `An error occurred while canceling the payment and updating the order: ${error.message}`,
//     });
//   }
// };
