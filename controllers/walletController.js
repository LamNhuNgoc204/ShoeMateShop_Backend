const mongoose = require("mongoose");
const Wallet = require("../models/walletModel");
const User = require("../models/userModel");
const { sendNotification } = require('../firebase');
const axios = require("axios").default;
const CryptoJS = require("crypto-js");
const moment = require("moment");
// Kích hoạt ví
const ZaloPayConfig = {
  app_id: "2554",
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

const depositWithZaloPay = async (req, res) => {
  const { amount } = req.body;
  const userId = req.user._id;
  console.log("userId zalo pay", userId);
  console.log("amount", amount);
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount", status: false });
  }

  try {
    // Tìm ví của người dùng
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found", status: false });
    }

    if (!wallet.isActive) {
      return res.status(400).json({ error: "Wallet is not active", status: false });
    }

    const transID = new mongoose.Types.ObjectId(); // Tạo transaction ID duy nhất

    // Tạo đơn hàng ZaloPay
    const order = {
      app_id: ZaloPayConfig.app_id,
      app_trans_id: `${moment().format("YYMMDD")}_${transID}`,
      app_user: userId.toString(),
      app_time: Date.now(),
      embed_data: "{}",
      item: "[{}]",
      amount: amount,
      description: `Nạp ${amount} VND vào ví MateShoe`,
      bank_code: "",
      callback_url: `https://ed4c-113-161-74-165.ngrok-free.app/wallet/callback?userId=${userId}`, 
    };

    // Ký mã hóa dữ liệu
    const data = `${ZaloPayConfig.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
    order.mac = CryptoJS.HmacSHA256(data, ZaloPayConfig.key1).toString();

    // Gửi yêu cầu đến ZaloPay
    const response = await axios.post(ZaloPayConfig.endpoint, null, {
      params: order,
    });
    console.log("response", response.data);

    const { return_code, return_message, zp_trans_id } = response.data;

    if (return_code !== 1) {
      return res.status(400).json({ error: return_message, status: false });
    }

    // Lưu giao dịch vào cơ sở dữ liệu
    // wallet.transactions.push({
    //   transactionId: response.data.zp_trans_token, 
    //   type: "deposit",
    //   amount: amount,
    //   timestamp: new Date(),
    //   status: "pending",
    // });

    // await wallet.save();

    // Trả về thông tin để người dùng thực hiện thanh toán
    res.status(200).json({
      message: "Deposit initiated. Complete the payment via ZaloPay.",
      zaloPayData: response.data,
      status: true,
    });
  } catch (error) {
    console.error("Error during ZaloPay deposit:", error.message);
    res.status(500).json({ error: "Failed to initiate deposit", status: false });
  }
};



const handleZaloPayCallback = async (req, res) => {
  // Truy cập các tham số từ query string (URL)
  const { userId } = req.query; 
  console.log("req.query", req.query);

  // Truy cập dữ liệu từ body (phần nội dung của POST request)
  const { data, mac, type } = req.body;
  console.log("req.body", req.body);

  // Parse data JSON nếu cần thiết
  let parsedData;
  try {
    parsedData = JSON.parse(data); // data là một chuỗi JSON, cần parse lại
  } catch (error) {
    console.error("Error parsing data:", error);
    return res.status(400).json({ error: "Invalid data format", status: false });
  }

  // Truy cập các thông tin từ parsedData
  const { amount, status, apptransid } = parsedData;

  console.log("amount", amount); // Đã lấy amount từ data
  console.log("status", status);
  console.log("checksum", mac); // mac là checksum
  console.log("apptransid", apptransid);
  console.log("userId", userId);

  // Tiến hành xử lý logic sau khi đã lấy được các giá trị cần thiết
};

const updateBalance = async (req, res) => {
  const { amount, transactionId } = req.body; 
  console.log("amount", amount);
  console.log("transactionId", transactionId);
  const userId = req.user._id; 

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount", status: false });
  }

  try {
    // Tìm ví của người dùng
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found", status: false });
    }

    if (!wallet.isActive) {
      return res.status(400).json({ error: "Wallet is not active", status: false });
    }

    // Cập nhật số dư ví
    wallet.balance += amount;
    wallet.transactions.push({
      transactionId: transactionId || new mongoose.Types.ObjectId(), 
      type: "deposit", 
      amount,
      timestamp: new Date(),
      
    });

    await wallet.save();

    res.status(200).json({ message: "Balance updated successfully", wallet, status: true });
  } catch (error) {
    console.error("Error updating wallet balance:", error.message);
    res.status(500).json({ error: "Failed to update balance", status: false });
  }
};






activateWallet = async (req, res) => {
  const { pin } = req.body;
  const userId = req.user._id;
  try {
    // Kiểm tra người dùng có tồn tại không
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Kiểm tra ví đã được kích hoạt chưa
    let wallet = await Wallet.findOne({ userId });
    if (wallet) {
      return res.status(400).json({ message: "Wallet already activated" });
    }

    // Tạo ví mới
    wallet = new Wallet({
      isActive: true,
      PIN: pin,
      userId: userId,
      balance: 0, // Giả sử ví mới sẽ có số dư là 0
      transactions: [], // Mảng giao dịch ban đầu rỗng
    });

    await wallet.save(); // Lưu ví vào MongoDB
    res.status(200).json({ message: "Wallet activated successfully", wallet ,status:true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" ,status:false });
  }
};

// Chuyển tiền
const transferMoney = async (req, res) => {
  const { recipientEmail, amount, message, pin } = req.body;
  const userId = req.user._id;
  const FCMToken = req.user.FCMToken;

  if (!amount || amount <= 0) {
    console.log("Invalid amount", amount);
    return res.status(200).json({ error: "Invalid amount", status: false,code: "Invalidamount" });
  }

  try {
    const senderWallet = await Wallet.findOne({ userId });
    if (!senderWallet.isActive) {
      console.log("Wallet is not active");
      return res.status(200).json({ error: "Wallet is not active", status: false ,code: "walletnotcreated"});
    }
    if (senderWallet.PIN !== pin) {
      console.log("Invalid PIN");
      return res.status(200).json({ error: "Invalid PIN", status: false ,code: "InvalidPIN"});
    }

    if (senderWallet.balance < amount) {
      console.log("Insufficient balance");
      return res.status(200).json({ error: "Insufficient balance", status: false ,code: "Insufficientbalance"});
    }

    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.status(200).json({ error: "Recipient not found", status: false ,code: "Recipientnotfound"});
    }

    const recipientWallet = await Wallet.findOne({ userId: recipient._id });
    if (!recipientWallet || !recipientWallet.isActive) {
      console.log("Recipient's wallet is not active");
      return res.status(200).json({ error: "Recipient's wallet is not active", status: false ,code: "Recipientwalletnotactive"});
    }

    const senderName = req.user.name; 
    const recipientName = recipient.name;
   
    senderWallet.balance -= amount;
    senderWallet.transactions.push({
      transactionId: new mongoose.Types.ObjectId(),
      type: "transfer",
      amount: -amount,
      recipientEmail,
      senderName,
      message: message || "",
      timestamp: new Date(),
    });
    await senderWallet.save();

    // Cập nhật ví của người nhận
    recipientWallet.balance += amount;
    recipientWallet.transactions.push({
      transactionId: new mongoose.Types.ObjectId(),
      type: "transfer",
      amount,
      senderName, 
      message: message || "",
      timestamp: new Date(),
    });
    await recipientWallet.save();

    const Userrecipient = await User.findOne({ _id: recipientWallet.userId });
    const FCMTokenrecipient = Userrecipient.FCMToken;
    // Nội dung thông báo cho người chuyển
    const senderContent = `Bạn đã chuyển ${amount} VND cho ${recipientName}. Số dư hiện tại của bạn: ${senderWallet.balance} VND.`;
    console.log("senderWallet", senderWallet);
    await sendNotification(FCMToken, 'MateShoe Staff 📝', senderContent);

    // Nội dung thông báo cho người nhận
    const recipientContent = `Bạn đã nhận ${amount} VND từ ${senderName}. Số dư hiện tại của bạn: ${recipientWallet.balance} VND.`;
    console.log("recipientWallet", recipientWallet);
    await sendNotification(FCMTokenrecipient, 'MateShoe Staff 📝', recipientContent);

    res.status(200).json({ message: "Transfer successful", senderWallet, recipientWallet, status: true ,code: "TransferSuccessful"});
  } catch (error) {
    res.status(500).json({ error: "Failed to transfer", status: false ,code: "FailedtoTransfer"});
  }
};

// Thanh toán
const makePayment = async (req, res) => {
  const { amount } = req.body;
  console.log("amount", amount);
  const userId = req.user._id;

  // Kiểm tra số tiền
  if (!amount || amount <= 0) {
    console.log("Invalid amount");
    return res.status(200).json({
      status: false,
      error: "Invalid amount",
      code: "Invalidamount"
    });
  }

  try {
    const wallet = await Wallet.findOne({ userId });

    // Kiểm tra ví tồn tại
    if (!wallet) {
      console.log("Wallet not found");
      return res.status(200).json({
        status: false,
        error: "Wallet not found",
        code: "walletnotcreated"
      });
    }

    // Kiểm tra ví có được kích hoạt hay không
    if (!wallet.isActive) {
      console.log("Wallet is not active");
      return res.status(200).json({
        status: false,
        error: "Wallet is not active",
        code: "walletnotactive"
      });
    }

    // Kiểm tra số dư trong ví
    if (wallet.balance < amount) {
      console.log("Insufficient balance");
      return res.status(200).json({
        status: false,
        error: "Insufficient balance",
        code: "Insufficientbalance"
      });
    }

    // Xử lý thanh toán
    wallet.balance -= amount;
    wallet.transactions.push({
      transactionId: new mongoose.Types.ObjectId(),
      type: "payment",
      amount: -amount,
      timestamp: new Date(),
    });

    await wallet.save();

    // Trả về thành công
    return res.status(200).json({
      status: true,
      message: "Payment successful",
      wallet
    });
  } catch (error) {
    // Xử lý lỗi server
    console.error("Error during payment processing:", error);
    return res.status(500).json({
      status: false,
      error: "Failed to process payment"
    });
  }
};





// Lấy số dư
const getBalance = async (req, res) => {
  const userId = req.user._id;
  // const { userId } = req.params;

  try {
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(200).json({ error: "Wallet not found" , isActive : false, status:false });
    }

    res.status(200).json({
      isActive: wallet.isActive,
      userId,
      balance: wallet.balance,
      status:true
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ error: "Failed to fetch balance", status:false });
  }
};

// Lấy lịch sử giao dịch
const getTransactions = async (req, res) => {
  const userId = req.user._id;
  try {
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found", status: false });
    }

    const sortedTransactions = wallet.transactions.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.status(200).json({
      userId,
      transactions: sortedTransactions,
      status: true
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions", status: false });
  }
};


getUserNameByEmail = async (req, res) => {
  const { email } = req.params;

  try {
    // Tìm người dùng theo email
    const user = await User.findOne({ email });

    // Nếu không tìm thấy người dùng
    if (!user) {
      return res.status(200).json({ message: "User not found" ,status:false });
    }

    // Trả về tên người dùng
    res.status(200).json({
      name: user.name,
      status:true
    });
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ message: "Server error" ,status:false });
  }
};

module.exports = {
  activateWallet,
  getUserNameByEmail,
  depositWithZaloPay,
  handleZaloPayCallback,
  transferMoney,
  makePayment,
  getBalance,
  updateBalance,
  getTransactions,
};
