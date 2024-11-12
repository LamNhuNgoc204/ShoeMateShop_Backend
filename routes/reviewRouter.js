const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const {
  createReview,
  checkUpdateReview,
  checkReviewById,
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

// Manage reviews
router.put(
  "/update-review-status/:reviewId",
  protect,
  adminMiddleware,
  checkUpdateReview,
  reviewController.updateReviewStatus
);

router.get(
  "/get-all-reviews",
  protect,
  adminMiddleware,
  reviewController.getAllReviews
);

router.get(
  "/get-pending-reviews",
  protect,
  adminMiddleware,
  reviewController.getPendingReviews
);

// Get review detail
router.get(
  "/get-review-detail/:reviewId",
  checkReviewById,
  reviewController.getReviewById
);

// Get list product's reviews
router.get(
  "/get-list-product-reviews/:productId",
  checkProductById,
  reviewController.getProductReviews
);

// Update product review
router.put(
  "/:productId/update-product-review/:reviewId",
  protect,
  checkUserUpdateReview,
  reviewController.updateProductReview
);

// Get user product reviews
router.get(
  "/get-user-reviews",
  protect,
  checkUserProductReview,
  reviewController.getUserProductReview
);

module.exports = router;
