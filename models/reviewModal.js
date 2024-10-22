const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5, // تحقق من أن التقييم بين 1 و 5
    },
    review: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 200,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true, // سيضيف `createdAt` و `updatedAt`
  }
);

reviewSchema.pre("save", function () {
  this.populate([
    {
      path: "user",
      select: "username",
    },
    {
      path: "product",
      select: "name",
    },
  ]);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
