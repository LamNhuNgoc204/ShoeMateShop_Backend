const Voucher = require("../models/voucherModel");

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

    res.status(200).json(updatedVoucher);
  } catch (error) {
    res.status(500).json({ message: "Error updating voucher", error });
  }
};

// Xóa voucher theo ID (Chỉ admin hoặc nhân viên)
exports.deleteVoucher = async (req, res) => {
  try {
    const deletedVoucher = await Voucher.findByIdAndDelete(req.params.id);

    if (!deletedVoucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }

    res
      .status(200)
      .json({ status: true, message: "Voucher deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting voucher", error });
  }
};

// Lấy danh sách tất cả các voucher
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find();
    res.status(200).json({ status: true, data: vouchers });
  } catch (error) {
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

    const voucher = await Voucher.findOne({ voucher_code });

    if (!voucher) {
      return res
        .status(404)
        .json({ status: false, message: "Voucher not found" });
    }

    if (totalOrderValue < voucher.min_order_value) {
      return res.status(400).json({
        status: false,
        message: `Order value must be at least ${voucher.min_order_value} to apply this voucher`,
      });
    }

    if (voucher.quantity <= 0) {
      return res
        .status(400)
        .json({ status: false, message: "No vouchers available" });
    }

    if (voucher.usedBy.includes(userId)) {
      return res.status(200).json({
        status: false,
        message: "This voucher has already been used by you",
      });
    }
    let discountAmount = (voucher.discount_value / 100) * totalOrderValue;
    if (discountAmount > voucher.max_discount_value) {
      discountAmount = voucher.max_discount_value;
    }
    const discountedPrice = totalOrderValue - discountAmount;

    voucher.quantity -= 1;
    voucher.usedBy.push(userId);
    await voucher.save();

    res.status(200).json({
      status: true,
      message: "Voucher applied successfully",
      originalPrice: totalOrderValue,
      discountedPrice,
      discountAmount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error applying voucher", error });
  }
};
