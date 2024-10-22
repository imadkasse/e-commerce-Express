const express = require("express");
const { protect } = require("../controllers/authController");
const { createReview, getReview } = require("../controllers/reviewController");

const router = express.Router();

router.route("/").post(protect, createReview);

router.route("/:reviewId").get(getReview);

module.exports = router;
