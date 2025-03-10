const express = require("express");
const {
  createReview,
  getReview,
  getAllReviews,
  updateReview,
  setId,
  deleteReview,
} = require("../controllers/review.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.route("/").post(protect, createReview).get(protect, getAllReviews);

router
  .route("/:reviewId")
  .get(getReview)
  .patch(protect, setId, updateReview)
  .delete(protect, setId, deleteReview);

module.exports = router;
