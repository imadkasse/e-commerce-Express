const express = require("express");
const { protect } = require("../controllers/authController");
const {
  createReview,
  getReview,
  getAllReviews,
  updateReview,
  setId,
  deleteReview,
} = require("../controllers/reviewController");

const router = express.Router();

router.route("/").post(protect, createReview).get(protect, getAllReviews);

router
  .route("/:reviewId")
  .get(getReview)
  .patch(protect, setId, updateReview)
  .delete(protect, setId, deleteReview);

module.exports = router;
