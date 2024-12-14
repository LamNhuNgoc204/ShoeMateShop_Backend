// Import mô-đun Order
const Order = require("../models/orderModel");
const OrderDetail = require("../models/orderDetailModel");
const Product = require("../models/productModel");
const moment = require("moment");
const User = require("../models/userModel");
// Hàm helper để xác định ngày bắt đầu và kết thúc cho từng khoảng thời gian
const getDateRange = (period, offset = 0) => {
  const now = new Date();
  let start, end;

  switch (period) {
    case "day":
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
      start.setDate(start.getDate() - offset);
      end.setDate(end.getDate() - offset);
      break;

    case "week":
      start = new Date(now.setDate(now.getDate() - now.getDay() - offset * 7));
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;

    case "month":
      start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case "year":
      start = new Date(now.getFullYear() - offset, 0, 1);
      end = new Date(now.getFullYear() - offset, 11, 31);
      end.setHours(23, 59, 59, 999);
      break;

    default:
      throw new Error("Invalid period");
  }

  return { start, end };
};

// API thống kê với tham số động cho khoảng thời gian
exports.getStats = async (req, res) => {
  const { period = "month", offset = 0 } = req.query;

  try {
    const { start, end } = getDateRange(period, parseInt(offset, 10));

    const stats = await Order.aggregate([
      { $match: { "timestamps.placedAt": { $gte: start, $lte: end } } },
      { $unwind: "$orderDetails" },
      {
        $lookup: {
          from: "orderdetails",
          localField: "orderDetails",
          foreignField: "_id",
          as: "orderDetail",
        },
      },
      { $unwind: "$orderDetail" },
      {
        $group: {
          _id: "$status",
          totalSales: { $sum: "$orderDetail.product.pd_quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$orderDetail.product.price", "$orderDetail.product.pd_quantity"] },
          },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      pending: { totalSales: 0, totalRevenue: 0, orderCount: 0 },
      processing: { totalSales: 0, totalRevenue: 0, orderCount: 0 },
      completed: { totalSales: 0, totalRevenue: 0, orderCount: 0 },
      cancelled: { totalSales: 0, totalRevenue: 0, orderCount: 0 },
      refunded: { totalSales: 0, totalRevenue: 0, orderCount: 0 },
    };

    stats.forEach((stat) => {
      if (formattedStats[stat._id] !== undefined) {
        formattedStats[stat._id] = {
          totalSales: stat.totalSales,
          totalRevenue: stat.totalRevenue,
          orderCount: stat.orderCount,
        };
      }
    });

    res.json({
      status: true,
      data: formattedStats,
      period: period,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};



// Best-selling products
exports.getBestSellingProducts = async (req, res) => {
  const { sort = "desc" } = req.query;
  try {
    const bestSelling = await Order.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$orderDetails" },
      {
        $lookup: {
          from: "orderdetails",
          localField: "orderDetails",
          foreignField: "_id",
          as: "orderDetail",
        },
      },
      { $unwind: "$orderDetail" },
      {
        $group: {
          _id: "$orderDetail.product.id",
          productName: { $first: "$orderDetail.product.name" },
          totalSold: { $sum: "$orderDetail.product.pd_quantity" },
        },
      },
      { $sort: { totalSold: sort === "asc" ? 1 : -1 } },
      { $limit: 10 },
    ]);
    res.json({ status: true, data: bestSelling });
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to fetch best-selling products" });
  }
};
;


exports.getRevenueByProduct = async (req, res) => {
  const { period = "week", offset = 0, status = "completed", sort = "desc" } = req.query;
  const { start, end } = getDateRange(period, offset);

  try {
    const revenueData = await Order.aggregate([
      { $match: { status, "timestamps.placedAt": { $gte: start, $lte: end } } },
      { $unwind: "$orderDetails" },
      {
        $lookup: {
          from: "orderdetails",
          localField: "orderDetails",
          foreignField: "_id",
          as: "orderDetail",
        },
      },
      { $unwind: "$orderDetail" },
      {
        $group: {
          _id: "$orderDetail.product.id",
          productName: { $first: "$orderDetail.product.name" },
          totalRevenue: {
            $sum: { $multiply: ["$orderDetail.product.price", "$orderDetail.product.pd_quantity"] },
          },
          totalSales: { $sum: "$orderDetail.product.pd_quantity" },
        },
      },
      { $sort: { totalRevenue: sort === "asc" ? 1 : -1 } },
    ]);

    const totalRevenue = revenueData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalSales = revenueData.reduce((sum, item) => sum + item.totalSales, 0);

    res.json({
      status: true,
      data: revenueData,
      totalRevenue,
      totalSales,
    });
  } catch (error) {
    console.error("Error fetching revenue by product:", error);
    res.status(500).json({ status: false, error: "Failed to fetch revenue by product" });
  }
};


// Revenue statistics by day, week, or month for line chart
exports.getRevenueStats = async (req, res) => {
  const { period = "week", offset = 0, status = "completed" } = req.query;
  const { start, end } = getDateRange(period, parseInt(offset, 10));

  try {
    let dateFormat;
    let dateRange;

    switch (period) {
      case "week":
        dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$timestamps.placedAt" } };
        dateRange = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(start);
          date.setDate(date.getDate() + i);
          return date.toISOString().split("T")[0];
        });
        break;

      case "month":
        dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$timestamps.placedAt" } };
        dateRange = Array.from({ length: 30 }, (_, i) => {
          const date = new Date(start);
          date.setDate(date.getDate() + i);
          return date.toISOString().split("T")[0];
        });
        break;

      case "year":
        dateFormat = { $dateToString: { format: "%Y-%m", date: "$timestamps.placedAt" } };
        dateRange = Array.from({ length: 12 }, (_, i) => {
          const date = new Date(start);
          date.setMonth(date.getMonth() + i);
          return date.toISOString().substring(0, 7);
        });
        break;

      default:
        return res.status(400).json({ status: false, error: "Invalid period" });
    }

    const stats = await Order.aggregate([
      { $match: { status, "timestamps.placedAt": { $gte: start, $lte: end } } },
      { $unwind: "$orderDetails" },
      {
        $lookup: {
          from: "orderdetails",
          localField: "orderDetails",
          foreignField: "_id",
          as: "orderDetail",
        },
      },
      { $unwind: "$orderDetail" },
      {
        $group: {
          _id: dateFormat,
          dailyRevenue: {
            $sum: { $multiply: ["$orderDetail.product.price", "$orderDetail.product.pd_quantity"] },
          },
          dailySales: { $sum: "$orderDetail.product.pd_quantity" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const filledStats = dateRange.map((date) => {
      const stat = stats.find((s) => s._id === date);
      return {
        _id: date,
        dailyRevenue: stat ? stat.dailyRevenue : 0,
        dailySales: stat ? stat.dailySales : 0,
      };
    });

    res.json({
      status: true,
      data: filledStats,
      period: period,
    });
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    res.status(500).json({ status: false, error: "Failed to fetch revenue stats" });
  }
};

exports.LowStock = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    console.log("Threshold:", threshold);

    // Lấy toàn bộ sản phẩm và populate các trường liên quan
    const allProducts = await Product.find({}).populate("brand category size.sizeId");

    // Lọc sản phẩm và chỉ giữ lại các size sắp hết hàng
    const lowStockProducts = allProducts
      .map(product => {
        // Lọc các size có số lượng dưới threshold
        const lowStockSizes = product.size.filter(size => size.quantity < threshold);

        // Nếu không có size nào thỏa mãn, bỏ qua sản phẩm
        if (lowStockSizes.length === 0) return null;

        // Trả về sản phẩm với thông tin size sắp hết hàng
        return {
          _id: product._id,
          name: product.name,
          description: product.description,
          brand: product.brand?.name || "N/A",
          category: product.category?.name || "N/A",
          lowStockSizes: lowStockSizes.map(size => ({
            sizeName: size.sizeId?.name || "Unknown",
            quantity: size.quantity
          }))
        };
      })
      .filter(product => product !== null); // Loại bỏ các sản phẩm không có size sắp hết hàng

    res.status(200).json({
      success: true,
      message: "Danh sách sản phẩm sắp hết hàng",
      data: lowStockProducts,
    });
  } catch (error) {
    console.error("Lỗi khi thống kê sản phẩm sắp hết hàng:", error);
    res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi trong khi xử lý yêu cầu",
      error: error.message,
    });
  }
};


  exports.getRegistrationStats = async (req, res) => {
    const { type } = req.query;  // Lấy type (year, month, week) từ query params
  
    try {
      let query = {};
      let result = [];
  
      if (type === "year") {
        // Thống kê theo năm (hiển thị 3 năm gần nhất)
        const currentYear = moment().year();  // Năm hiện tại
        for (let i = 0; i < 3; i++) {
          const yearToCheck = currentYear - i;
          const startDate = moment().year(yearToCheck).startOf("year").toDate();
          const endDate = moment().year(yearToCheck).endOf("year").toDate();
  
          // Tìm số lượng người dùng đăng ký trong năm
          const count = await User.countDocuments({
            createAt: { $gte: startDate, $lt: endDate },
          });
  
          result.push({ year: yearToCheck, count });
        }
      } else if (type === "month") {
        // Thống kê theo tháng (30 ngày trong tháng hiện tại)
        const startDate = moment().startOf("month").toDate();  // Ngày đầu tháng
        const endDate = moment().endOf("month").toDate();  // Ngày cuối tháng
  
        const countByDay = [];
        // Lặp qua từng ngày trong tháng
        for (let i = 0; i < 30; i++) {
          const dayStart = moment(startDate).add(i, "days").startOf("day").toDate();
          const dayEnd = moment(dayStart).endOf("day").toDate();
          
          const count = await User.countDocuments({
            createAt: { $gte: dayStart, $lt: dayEnd },
          });
  
          countByDay.push({ day: moment(dayStart).format("YYYY-MM-DD"), count });
        }
        result = countByDay;
      } else if (type === "week") {
        // Thống kê theo tuần (7 ngày trong tuần hiện tại)
        const startOfWeek = moment().startOf("week").toDate();  // Ngày đầu tuần
        const endOfWeek = moment().endOf("week").toDate();  // Ngày cuối tuần
  
        const countByDay = [];
        // Lặp qua 7 ngày trong tuần
        for (let i = 0; i < 7; i++) {
          const dayStart = moment(startOfWeek).add(i, "days").startOf("day").toDate();
          const dayEnd = moment(dayStart).endOf("day").toDate();
          
          const count = await User.countDocuments({
            createAt: { $gte: dayStart, $lt: dayEnd },
          });
  
          countByDay.push({ day: moment(dayStart).format("YYYY-MM-DD"), count });
        }
        result = countByDay;
      } else {
        return res.status(400).json({ success: false, message: "Invalid type. Use 'year', 'month', or 'week'." });
      }
  
      return res.json({ success: true, data: result });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: err.message });
    }
  };
  