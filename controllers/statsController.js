<<<<<<< Updated upstream
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
=======
// controllers/statsController.js
const Order = require("../models/orderModel");

// Helper to get date ranges
const getStartOfPeriod = (period) => {
  const now = new Date();
  switch (period) {
    case "day":
      return new Date(now.setHours(0, 0, 0, 0));
    case "week":
      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - now.getDay());
      return new Date(startOfWeek.setHours(0, 0, 0, 0));
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "year":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null;
  }
};

// Daily sales statistics
exports.getDailyStats = async (req, res) => {
  try {
    const startOfDay = getStartOfPeriod("day");
    const stats = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, status: "completed" } },
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    res.json({
        status: stats.length > 0,
        totalSales: stats[0]?.totalSales || 0,
        totalRevenue: stats[0]?.totalRevenue || 0
      });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
=======
    res.json(stats[0] || { totalSales: 0, totalRevenue: 0 });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch daily stats" });
  }
};

// Weekly sales statistics
exports.getWeeklyStats = async (req, res) => {
  try {
    const startOfWeek = getStartOfPeriod("week");
    const stats = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfWeek }, status: "completed" } },
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
    res.json(stats[0] || { totalSales: 0, totalRevenue: 0 });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weekly stats" });
  }
};

// Monthly sales statistics
exports.getMonthlyStats = async (req, res) => {
  try {
    const startOfMonth = getStartOfPeriod("month");
    const stats = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: "completed" } },
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
    res.json(stats[0] || { totalSales: 0, totalRevenue: 0 });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch monthly stats" });
  }
};

// Yearly sales statistics
exports.getYearlyStats = async (req, res) => {
  try {
    const startOfYear = getStartOfPeriod("year");
    const stats = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfYear }, status: "completed" } },
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
    res.json(stats[0] || { totalSales: 0, totalRevenue: 0 });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch yearly stats" });
>>>>>>> Stashed changes
  }
};

// Best-selling products
exports.getBestSellingProducts = async (req, res) => {
<<<<<<< Updated upstream
  const { sort = "desc" } = req.query;
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      { $sort: { totalSold: sort === "asc" ? 1 : -1 } },
      { $limit: 10 },
    ]);
    res.json({status: true, data: bestSelling});
  } catch (error) {
    res.status(500).json({ status: false, error: "Failed to fetch best-selling products" });
  }
};

// exports.getRevenueByProduct = async (req, res) => {
//   const { sort = "desc" } = req.query; // "asc" để sắp xếp tăng dần, "desc" để sắp xếp giảm dần

//   try {
//     const revenueData = await Order.aggregate([
//       { $match: { status: "completed" } }, // Lọc theo trạng thái đơn hàng hoàn thành
//       { $unwind: "$orderDetails" },
//       {
//         $lookup: {
//           from: "orderdetails",
//           localField: "orderDetails",
//           foreignField: "_id",
//           as: "orderDetail",
//         },
//       },
//       { $unwind: "$orderDetail" },
//       {
//         $group: {
//           _id: "$orderDetail.product.id", // Sử dụng 'product.id' thay vì '_id'
//           productName: { $first: "$orderDetail.product.name" }, // Lưu tên sản phẩm
//           totalRevenue: {
//             $sum: { $multiply: ["$orderDetail.product.price", "$orderDetail.product.pd_quantity"] },
//           },
//           totalSales: { $sum: "$orderDetail.product.pd_quantity" },
//         },
//       },
//       {
//         $sort: { totalRevenue: sort === "asc" ? 1 : -1 }, // Sắp xếp theo tổng doanh thu
//       },
//     ]);

//     res.json({
//       status: true,
//       data: revenueData.length > 0 ? revenueData : [],
//     });
//   } catch (error) {
//     console.error("Error fetching revenue by product:", error);
//     res.status(500).json({ status: false, error: "Failed to fetch revenue by product" });
//   }
// };

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
=======
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);
    res.json(bestSelling);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch best-selling products" });
  }
};
>>>>>>> Stashed changes
