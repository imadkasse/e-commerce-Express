const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeaturs");
const Review = require("../models/reviewModal");
const User = require("../models/userModel.");
const Product = require("../models/productModel");
const factory = require("./handelFactory");

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
  if (user.role === "admin") {
    return next(
      new AppError(
        "You are not authorized to perform this action, only by user ",
        403
      )
    );
  }
  req.body.user = user._id;
  const review = await Review.create(req.body);
  if (!review) {
    return next(new AppError("Failed to create review", 500));
  }
  const product = await Product.findByIdAndUpdate(req.body.product, {
    $push: { reviews: review._id },
  });
  if (!product) {
    return next(new AppError("Product not found with that Id", 404));
  }
  console.log(product);
  res.status(201).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.getAllReviews = factory.getAll(Review);

//! this is middleware for repalce reviewID => id
exports.setId = (req, res, next) => {
  req.params.id = req.params.reviewId;
  next();
};

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
