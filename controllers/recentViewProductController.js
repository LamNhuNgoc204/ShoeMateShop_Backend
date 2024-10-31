const RecentView = require("../models/RecentView");

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
    const recentView = await RecentView.findOne({ userId }).populate(
      "products.productId"
    );

    if (!recentView) {
      return (recentView = []);
    }

    return res.status(200).json({ status: true, data: recentView.products });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: "Lỗi khi lấy danh sách sản phẩm đã xem gần đây.",
    });
  }
};
