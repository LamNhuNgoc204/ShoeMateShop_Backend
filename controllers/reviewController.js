const Review = require("../models/reviewModel");
const OrderDetail = require("../models/orderDetailModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");

//Lay tung sp chua review trong don hang da hoan thanh
exports.getUnreviewedProductsInOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreviewedProducts = await OrderDetail.find({
      isReviewed: false,
      order_id: {
        $in: await Order.find({ user_id: userId }).distinct("_id"),
      },
    });

    if (unreviewedProducts.length === 0) {
      return res.status(200).json({
        status: true,
        message: "All products in the order have been reviewed.",
        data: [],
      });
    }

    return res.status(200).json({
      status: true,
      message: "Retrieved unreviewed products successfully.",
      data: unreviewedProducts,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

//Lay don hang co sp chua dc review
// exports.getUnreviewedOrdersWithProducts = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const unreviewedOrders = await Order.find({
//       user_id: userId,
//       status: "completed",
//       isReviewed: false,
//     }).lean();

//     const ordersWithUnreviewedProducts = await Promise.all(
//       unreviewedOrders.map(async (order) => {
//         const unreviewedProducts = await OrderDetail.find({
//           order_id: order._id,
//           isReviewed: false,
//         })
//           // .select("product")
//           // .lean();

//         console.log("unreviewedProducts", unreviewedProducts);

//         return {
//           ...order,
//           product: unreviewedProducts,
//         };
//       })
//     );

//     if (ordersWithUnreviewedProducts.length === 0) {
//       return res.status(200).json({
//         status: true,
//         message: "All orders and products have been reviewed.",
//         data: [],
//       });
//     }

//     console.log("ordersWithUnreviewedProducts", ordersWithUnreviewedProducts);

//     return res.status(200).json({
//       status: true,
//       message: "Retrieved unreviewed orders with products successfully.",
//       data: ordersWithUnreviewedProducts,
//     });
//   } catch (error) {
//     console.error("Error: ", error);
//     return res.status(500).json({ status: false, message: "Server error" });
//   }
// };

exports.getUnreviewedOrdersWithProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const unreviewedOrders = await Order.find({
      user_id: userId,
      status: "completed",
      isReviewed: false,
    }).lean();

    const ordersWithUnreviewedProducts = await Promise.all(
      unreviewedOrders.map(async (order) => {
        const unreviewedProducts = await OrderDetail.find({
          order_id: order._id,
          isReviewed: false,
        });
        // .populate("product")
        // .lean();

        // const formattedUnreviewedProducts = unreviewedProducts.map((item) => ({
        //   id: item.product.id,
        //   pd_image: item.product.pd_image,
        //   name: item.product.name,
        //   size_name: item.product.size_name,
        //   price: item.product.price,
        //   pd_quantity: item.product.pd_quantity,
        //   size_id: item.product.size_id,
        // }));

        return {
          ...order,
          product: unreviewedProducts,
        };
      })
    );

    if (ordersWithUnreviewedProducts.length === 0) {
      return res.status(200).json({
        status: true,
        message: "All orders and products have been reviewed.",
        data: [],
      });
    }

    return res.status(200).json({
      status: true,
      message: "Retrieved unreviewed orders with products successfully.",
      data: ordersWithUnreviewedProducts,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

//Review nhieu don hang
exports.createMultipleReviews = async (req, res) => {
  try {
    // Nhan mang reviews tu body
    const { reviews } = req.body;

    console.log("Danh sách sp cần review", reviews);

    const reviewer_id = req.user._id;

    const reviewPromises = reviews.map(async (reviewData) => {
      const {
        orderDetail_id,
        product_id,
        rating,
        comment,
        images,
        video,
        size,
      } = reviewData;

      const orderDetail = await OrderDetail.findById(orderDetail_id);
      if (!orderDetail) throw new Error("Order detail not found");

      const newReview = new Review({
        orderDetail_id,
        product_id,
        reviewer_id,
        rating,
        comment,
        images,
        video,
        size,
      });
      await newReview.save();

      await OrderDetail.findByIdAndUpdate(orderDetail_id, { isReviewed: true });

      return newReview;
    });

    const newReviews = await Promise.all(reviewPromises);

    const order_id = reviews[0].orderDetail_id;

    const allOrderDetails = await OrderDetail.find({ order_id });
    const isAllReviewed = allOrderDetails.every((detail) => detail.isReviewed);

    if (isAllReviewed) {
      await Order.findByIdAndUpdate(order_id, { isReviewed: true });
    }

    return res.status(200).json({
      status: true,
      message: "Reviews created successfully for multiple products.",
      data: newReviews,
    });
  } catch (error) {
    console.error("Error: ", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// for admin
exports.updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    // Xác thực status
    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid review status" });
    }

    // Xử lý khi status là "rejected"
    if (status) {
      const review = await Review.findByIdAndUpdate(
        reviewId,
        { status },
        { new: true }
      );

      if (!review) {
        return res
          .status(404)
          .json({ status: false, message: "Review not found" });
      }

      return res.status(200).json({
        status: true,
        message: "Review rejected and deleted successfully",
        data: review,
      });
    }
  } catch (error) {
    console.error("Error updating review status:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

// For admin
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("product_id", "name assets")
      .populate("reviewer_id", "email name");

    return res.status(200).json({
      status: true,
      message: "Retrieved all reviews",
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// get list review's product
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = req.review;
    return res.status(200).json({
      status: true,
      message: "Get product review successfully",
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Update product review
exports.updateProductReview = async (req, res) => {
  try {
    const { rating, comment, images, video } = req.body;

    const review = req.review;

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.images = images || review.images;
    review.video = video || review.video;
    await review.save();

    return res.status(200).json({
      status: true,
      message: "Update review successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

//Phản hồi đánh giá người dùng
exports.respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        status: false,
        message: "Content is required",
      });
    }

    // Tìm và cập nhật phản hồi cho review
    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        responder_id: req.user._id,
        response: { content, createdAt: new Date() },
      },
      { new: true }
    );

    // Kiểm tra nếu review không tồn tại
    if (!review) {
      return res
        .status(404)
        .json({ status: false, message: "Review not found" });
    }

    return res.status(200).json({
      status: true,
      data: review,
      message: "Response added successfully",
    });
  } catch (error) {
    console.error("Error responding to review:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

//Lấy ds review cho từng sp
const mongoose = require("mongoose");
exports.getReviewByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await Review.find({
      product_id: new mongoose.Types.ObjectId(productId),
    })
      .populate({
        path: "product_id",
        select: "size",
        populate: {
          path: "size.sizeId",
          select: "name",
        },
      })
      .populate("reviewer_id", "name email avatar")
      .populate("responder_id", "name email avatar")
      .exec();

    if (!result || result.length === 0) {
      return res.status(200).json({ status: true, data: [] });
    }

    return res.status(200).json({
      status: true,
      data: result,
    });
  } catch (error) {
    console.error("Error responding to review:", error);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

exports.getUserProductReview = async (req, res) => {
  try {
    const userReviews = req.reviews;

    if (userReviews?.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No reviews found for this user.",
        data: [],
      });
    }

    console.log("userReviews", userReviews);

    return res.status(200).json({
      status: true,
      message: "Retrieved user's reviews by product successfully.",
      data: userReviews,
    });
  } catch (error) {
    console.error("Error fetching user reviews by product:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
