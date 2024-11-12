const Review = require("../models/reviewModel");
const OrderDetail = require("../models/orderDetailModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");

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
        })
          .select("product")
          .lean();

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
    // Danh sách các sản phẩm cần review
    const { reviews } = req.body;

    const reviewer_id = req.user._id;

    const reviewPromises = reviews.map(async (reviewData) => {
      const { orderDetail_id, product_id, rating, comment, images, video } =
        reviewData;

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

    let review;

    if (status === "rejected") {
      review = await Review.findByIdAndDelete(reviewId);

      if (!review) {
        return res
          .status(400)
          .json({ status: false, message: "Review not found" });
      }

      return res.status(200).json({
        status: true,
        message: "Review rejected and deleted successfully",
      });
    } else {
      review = await Review.findByIdAndUpdate(
        reviewId,
        { status },
        { new: true }
      );

      if (!review) {
        return res
          .status(400)
          .json({ status: false, message: "Review not found" });
      }

      return res.status(200).json({
        status: true,
        message: "Review approved successfully",
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
    const reviews = await Review.find();
    return res.status(200).json({
      status: true,
      message: "Retrieved all reviews",
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// For admin
exports.getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: "pending" });
    return res
      .status(200)
      .json({ status: true, message: "Get reviews pending", data: reviews });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

// Get review detail
exports.getReviewById = async (req, res) => {
  try {
    const review = req.review;

    return res.status(200).json({
      status: true,
      message: "Retrieved review successfully",
      data: review,
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

// Get user product reviews
exports.getUserProductReview = async (req, res) => {
  try {
    const reviews = req.reviews;

    return res.status(200).json({
      status: true,
      message: "Get list user's reviews successfully",
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error" });
  }
};
