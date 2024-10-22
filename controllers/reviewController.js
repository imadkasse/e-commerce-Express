const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeaturs");
const Review = require("../models/reviewModal");
const User = require("../models/userModel.");
const Product = require("../models/productModel");

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) {
    return next(new AppError("Review not found with that Id", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("User not found with that Id", 404));
  }
  req.body.user = user._id;
  const review = await Review.create(req.body);
  if (!review) {
    return next(new AppError("Failed to create review", 500));
  }
  // const ProductReview = await Product.findById(review.product);
  // console.log(ProductReview);
  res.status(201).json({
    status: "success",
    data: {
      review,
    },
  });
});
