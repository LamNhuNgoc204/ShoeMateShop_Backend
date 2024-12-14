const RecentView = require("../models/RecentView");
const Review = require("../models/reviewModel");
const Wishlist = require("../models/wishlistModel");

exports.addRecentView = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;
  try {
    let recentView = await RecentView.findOne({ userId });

    if (!recentView) {
      recentView = new RecentView({ userId, products: [{ productId }] });
    } else {
      const existingProductIndex = recentView.products.findIndex(
        (p) => p.productId.toString() === productId
      );

      if (existingProductIndex !== -1) {
        recentView.products[existingProductIndex].viewedAt = Date.now();
      } else {
        recentView.products.unshift({ productId });
      }
    }

    await recentView.save();
    return res.status(200).json({
      status: true,
      message: "The product has been added to the viewed list.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: "Error adding product to viewed list." });
  }
};

exports.getRecentViews = async (req, res) => {
  const userId = req.user._id;
  try {
    const recentView = await RecentView.findOne({ userId })
      .populate("products.productId") // Populate các sản phẩm
      .lean();

    // Kiểm tra nếu không có sản phẩm nào
    if (!recentView || !recentView.products.length) {
      return res.status(200).json({ status: true, data: [] });
    }

    for (let product of recentView.products) {
      const productId = product?.productId;

      if (!productId) {
        continue;
      }

      const reviews = await Review.find({ product_id: productId?._id }).select(
        "rating"
      );

      // Tính tổng rating và số lượng đánh giá
      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const numOfReviews = reviews.length;
      const avgRating = numOfReviews
        ? (totalRating / numOfReviews).toFixed(1)
        : 0;

      // Thêm trường mới vào productId
      const updatedProduct = { ...productId, avgRating, numOfReviews };

      if (userId) {
        const isFavorite = await Wishlist.exists({
          user_id: userId,
          product_id: productId?._id,
        });
        updatedProduct.isFavorite = !!isFavorite;
      } else {
        updatedProduct.isFavorite = false;
      }

      // const isFavorite = userId
      //   ? await Wishlist.exists({
      //       user_id: userId,
      //       product_id: productId?._id,
      //     })
      //   : false;

      // updatedProduct.isFavorite = isFavorite;

      // Cập nhật lại productId với các trường mới
      product.productId = updatedProduct;
    }

    console.log("recentView.products==>", recentView.products[0]);

    return res.status(200).json({ status: true, data: recentView.products });
  } catch (error) {
    console.log("Lỗi", error);

    return res.status(500).json({
      status: false,
      error: "Lỗi khi lấy danh sách sản phẩm đã xem gần đây.",
    });
  }
};
