const mongoose = require("mongoose");
const Product = require("./productModel");

const reviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
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
    timestamps: true,
  }
);

// create index
reviewSchema.indexes({ user: 1, product: 1 }, { unique: true });

reviewSchema.pre(/^findOne/, function (next) {
  this.populate([
    {
      path: "product",
      select: "name ",
    },
    {
      path: "user",
      select: "username",
    },
  ]);
  next();
});
reviewSchema.pre(/^find/, function (next) {
  this.populate([
    {
      path: "user",
      select: "username ",
    },
  ]);
  next();
});

reviewSchema.statics.calcAverageRatings = async function (productId) {
  //!clalc avrege rating
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  //? save the avg in the tour model
  console.log(stats);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      avgReviews: stats[0].avgRating,
      numReview: stats[0].nRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      avgReviews: 0,
      numReview: 4.5,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.product);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  // حفظ المنتج المتعلق بالمراجعة باستخدام هذا.getQuery()
  const review = await this.model.findOne(this.getQuery());
  this.r = review; // هذا يمكن استخدامه لاحقًا
  console.log(review);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // استخدام this.r فقط بدون استعلام جديد
  if (this.r) {
    await this.r.constructor.calcAverageRatings(this.r.product);
    console.log("ecetcs");
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
