const Voucher = require("../models/voucherModel");
// Thư viện chạy tự động, dành cho việc chuyển đổi trạng thái voucher khi hết hạn
const cron = require("node-cron");

const BATCH_SIZE = 1000;

const processExpiredVouchers = async () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let updatedCount = 0;

  while (true) {
    const vouchers = await Voucher.find({
      expiry_date: { $lt: today },
      status: "active",
    })
      .limit(BATCH_SIZE)
      .select("_id");

    if (vouchers.length === 0) break; // Không còn voucher để xử lý

    // Cập nhật trạng thái
    const ids = vouchers.map((v) => v._id);
    const result = await Voucher.updateMany(
      { _id: { $in: ids } },
      { $set: { status: "inactive" } }
    );

    updatedCount += result.modifiedCount;
    console.log(`Processed ${result.modifiedCount} vouchers in this batch.`);
  }

  console.log(`Total updated vouchers: ${updatedCount}`);
};

// Cron job chạy lúc 23:59 => 59 23 * * *
cron.schedule("59 23 * * *", processExpiredVouchers);

exports.createVoucher = async (req, res) => {
  try {
    const {
      discount_value,
      voucher_name,
      quantity,
      voucher_image,
      voucher_code,
      expiry_date,
      start_date,
      usage_conditions,
      usage_scope,
      min_order_value,
      max_discount_value,
    } = req.body;

    // Kiểm tra xem mã voucher có bị thiếu hay không
    if (!voucher_code) {
      return res
        .status(400)
        .json({ status: false, message: "Voucher code is required" });
    }

    // Kiểm tra xem mã voucher đã tồn tại hay chưa
    const existingVoucher = await Voucher.findOne({
      voucher_code,
      status: "inactive",
    });
    if (existingVoucher) {
      return res
        .status(400)
        .json({ status: false, message: "Voucher code already exists" });
    }

    // Tạo đối tượng voucher mới
    const newVoucher = new Voucher({
      discount_value,
      voucher_name,
      quantity,
      voucher_image,
      voucher_code,
      expiry_date,
      start_date,
      usage_conditions,
      usage_scope,
      min_order_value,
      max_discount_value,
    });

    // Lưu voucher mới vào cơ sở dữ liệu
    const savedVoucher = await newVoucher.save();
    res.status(201).json({
      status: true,
      message: "Voucher created successfully",
      data: savedVoucher,
    });
  } catch (error) {
    // Xử lý lỗi nếu có
    res.status(500).json({ message: "Error creating voucher", error });
  }
};

// Cập nhật voucher theo ID (Chỉ admin hoặc nhân viên)
exports.updateVoucher = async (req, res) => {
  try {
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedVoucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    res.status(200).json({ status: true, data: updatedVoucher });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Error updating voucher", error });
  }
};

// Xóa voucher theo ID (Chỉ admin hoặc nhân viên)
exports.deleteVoucher = async (req, res) => {
  try {
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true }
    );
    if (!updatedVoucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }
    res.status(200).json({
      status: true,
      message: "Voucher status updated to inactive successfully",
      voucher: updatedVoucher,
    });
  } catch (error) {
    console.error("Error updating voucher status:", error);
    res.status(500).json({ message: "Error updating voucher status", error });
  }
};

// Lấy danh sách tất cả các voucher

exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({
      status: "active",
      expiry_date: { $gte: new Date() },
    });
    res.status(200).json({ status: true, data: vouchers });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Error fetching vouchers", error });
  }
};

exports.getAllVouchersForWeb = async (req, res) => {
  try {
    const { page = 1, limit = 10, statusFilter = "all" } = req.query;
    const skip = (page - 1) * limit;

    // Lọc theo trạng thái
    let statusCondition = {};
    if (statusFilter === "active") {
      statusCondition = { status: "active" }; // 'active'
    } else if (statusFilter === "inactive") {
      statusCondition = { status: "inactive" }; // 'inactive'
    }

    const totalVouchers = await Voucher.countDocuments(statusCondition);
    const activeVC = await Voucher.find({ status: "active" });
    const inactiveVC = await Voucher.find({ status: "inactive" });

    // Lấy voucher theo điều kiện
    const vouchers = await Voucher.find(statusCondition)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalPages = Math.ceil(totalVouchers / limit);

    res.status(200).json({
      status: true,
      data: vouchers,
      totalVouchers,
      totalPages,
      currentPage: parseInt(page),
      limit: parseInt(limit),
      activeVC,
      inactiveVC,
    });
  } catch (error) {
    console.log("error===", error);

    res
      .status(500)
      .json({ status: false, message: "Error fetching vouchers", error });
  }
};

// Lấy chi tiết voucher theo ID
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    res.status(200).json(voucher);
  } catch (error) {
    res.status(500).json({ message: "Error fetching voucher", error });
  }
};

// Tìm kiếm voucher theo tên hoặc mã
exports.searchVouchers = async (req, res) => {
  const { query } = req.query;

  try {
    const vouchers = await Voucher.find({
      $or: [
        { voucher_name: new RegExp(query, "i") },
        { voucher_code: new RegExp(query, "i") },
      ],
    });
    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ message: "Error searching vouchers", error });
  }
};
// Áp dụng voucher vào đơn hàng
exports.applyVoucher = async (req, res) => {
  try {
    userId = req.user._id;
    const { voucher_code, totalOrderValue } = req.body;
    console.log(req.body);

    const voucher = await Voucher.findOne({ voucher_code });

    if (!voucher) {
      return res
        .status(404)
        .json({
          status: false,
          message: "Voucher not found",
          code: "notfound",
        });
    }

    if (totalOrderValue < voucher.min_order_value) {
      console.log("totalOrderValue", voucher.min_order_value);
      return res.status(200).json({
        status: false,
        code: "minordervalue",
        message: `Order value must be at least ${voucher.min_order_value} to apply this voucher`,
      });
    }

    if (voucher.quantity <= 0) {
      console.log(voucher.quantity);
      return res
        .status(200)
        .json({
          status: false,
          message: "No vouchers available",
          code: "quantity",
        });
    }

    if (voucher.usedBy.includes(userId)) {
      console.log(voucher.usedBy);
      return res.status(200).json({
        code: "usedBy",
        status: false,
        message: "This voucher has already been used by you",
      });
    }
    let discountAmount = (voucher.discount_value / 100) * totalOrderValue;
    if (discountAmount > voucher.max_discount_value) {
      discountAmount = voucher.max_discount_value;
    }
    const discountedPrice = totalOrderValue - discountAmount;
    console.log("discountedPrice", discountedPrice);
    res.status(200).json({
      status: true,
      code: "success",
      message: "Voucher applied successfully",
      originalPrice: totalOrderValue,
      discountedPrice,
      discountAmount,
      voucher_code: voucher.voucher_code,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error applying voucher", error });
  }
};
