// Import mô-đun Order
const Order = require("../models/orderModel");
const OrderDetail = require("../models/orderDetailModel");
const Product = require("../models/productModel");
const moment = require("moment");
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
  const { period = "month", offset = 0,status="completed" } = req.query;

  try {
    const { start, end } = getDateRange(period, parseInt(offset, 10));
    const stats = await Order.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: status } },
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
          _id: null,
          totalSales: { $sum: "$orderDetail.product.pd_quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$orderDetail.product.price", "$orderDetail.product.pd_quantity"] },
          },
        },
      },
    ]);
    res.json({
        status: stats.length > 0,
        totalSales: stats[0]?.totalSales || 0,
        totalRevenue: stats[0]?.totalRevenue || 0
      });
  } catch (error) {
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
    res.json({status: true, data: bestSelling});
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to fetch best-selling products" });
  }
};


exports.getRevenueByProduct = async (req, res) => {
  const { period = "week", offset = 0, status = "completed", sort = "desc" } = req.query;
  const { start, end } = getDateRange(period, offset);

  try {
    const revenueData = await Order.aggregate([
      { $match: { status, createdAt: { $gte: start, $lte: end } } },
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

    // Tính tổng doanh thu của toàn bộ sản phẩm trong khoảng thời gian đã chọn
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
    // Determine the grouping format for MongoDB based on period
    let dateFormat;
    let dateRange;
    
    switch (period) {
      case "week":
        dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        dateRange = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(start);
          date.setDate(date.getDate() + i);
          return date.toISOString().split("T")[0];
        });
        break;
        
      case "month":
        dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        dateRange = Array.from({ length: 30 }, (_, i) => {
          const date = new Date(start);
          date.setDate(date.getDate() + i);
          return date.toISOString().split("T")[0];
        });
        break;
        
      case "year":
        dateFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
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
      { $match: { status, createdAt: { $gte: start, $lte: end } } },
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
      { $sort: { _id: 1 } }, // Sort by date ascending
    ]);

    // Fill missing dates in the range with zero values
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

