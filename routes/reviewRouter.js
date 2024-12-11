const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const {
  checkUpdateReview,
  checkProductById,
  checkUserUpdateReview,
  checkUserProductReview,
} = require("../middlewares/reviewMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const { adminMiddleware } = require("../middlewares/adminMiddleware");

// url: http://localhost:3000/reviews

router.get(
  "/product-unreview",
  protect,
  reviewController.getUnreviewedOrdersWithProducts
);

//Review nhieu sp trong 1 don hang
router.post("/", protect, reviewController.createMultipleReviews);

// Duyệt đánh giá
router.put(
  "/update-review-status/:reviewId",
  protect,
  adminMiddleware,
  checkUpdateReview,
  reviewController.updateReviewStatus
);

//Lấy đánh giá cho web
router.get(
  "/get-all-reviews",
  protect,
  adminMiddleware,
  reviewController.getAllReviews
);

// Get list product's reviews
router.get(
  "/get-list-product-reviews/:productId",
  checkProductById,
  reviewController.getReviewByProductId
);

// Get user product reviews
router.get(
  "/get-user-reviews",
  protect,
  checkUserProductReview,
  reviewController.getUserProductReview
);

// Update product review
router.put(
  "/:productId/update-product-review/:reviewId",
  protect,
  checkUserUpdateReview,
  reviewController.updateProductReview
);

// Phản hồi đánh giá người
router.put(
  "/respondtoreview/:reviewId",
  protect,
  adminMiddleware,
  reviewController.respondToReview
);

module.exports = router;
