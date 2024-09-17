const Product = require("./../models/productModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("./../utils/apiFeaturs");
const User = require("../models/userModel.");

// Products Function
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const products = await features.query;
  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Product.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      newProduct,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError("Product not found with that Id", 404));
  }
  res.status(200).json({
    status: "success ",
    data: {
      product,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    return next(new AppError("Product not found with that Id", 404));
  }
  res.status(200).json({
    status: "success ",
    data: {
      product,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return next(new AppError("Product not found with that Id", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Shop Cart Functions
exports.getShopCart = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("User not found with that Id", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      shopCart: user.shopCart,
    },
  });
});

exports.addProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError("Product not found with that Id", 404));
  }

  // Add to Cart
  // Check if the product already exists in the shopCart
  const user = await User.findById(req.user.id);
  if (user.shopCart.includes(product._id)) {
    return next(new AppError("Product already in the cart", 400));
  }

  // Add to Cart using findByIdAndUpdate
  await User.findByIdAndUpdate(req.user.id, {
    $push: { shopCart: product._id },
  });

  res.status(201).json({
    status: "success",
    message: "Product added successfully",
  });
});

exports.removeProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found with that Id", 404));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $pull: { shopCart: product._id },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(204).json({
    status: "success",
    message: "Product removed successfully",
  });
});

exports.clearCart = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, {
    $set: { shopCart: [] },
  });
  if (!user) {
    return next(new AppError("User not found with that Id", 404));
  }

  res.status(200).json({
    status: "success",
    message: "clear Shop Cart succssesful",
  });
});

// Favorite Functions

exports.addProductToFav = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError("Product not found with that Id", 404));
  }

  const user = await User.findById(req.user.id);

  const isProductInFavorites = user.favorites.some(
    (favorite) => favorite._id.toString() === product._id.toString()
  );

  if (isProductInFavorites) {
    return next(new AppError("Product is already in your Favorites", 400));
  }

  await User.findByIdAndUpdate(req.user.id, {
    $push: { favorites: product._id },
  });

  res.status(201).json({
    status: "success",
    message: "Product added to Favorites successfully",
  });
});

exports.removeProductFromFav = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError("Product not found with that Id", 404));
  }
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $pull: { favorites: product._id },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(204).json({
    status: "success",
    message: "Product removed from Favorites successfully",
  });
});

exports.getFavorite = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("User not found with that Id", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      favorites: user.favorites,
    },
  });
});

exports.clearFav = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, {
    $set: { favorites: [] },
  });
  if (!user) {
    return next(new AppError("User not found with that Id", 404));
  }
  res.status(200).json({
    status: "success",
    message: "clear Favorites succssesful",
  });
});

// Orders Functions

exports.addOrder = catchAsync(async (req, res, next) => {});
