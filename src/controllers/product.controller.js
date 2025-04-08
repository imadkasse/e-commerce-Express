const Product = require("../models/productModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeaturs");
const User = require("../models/userModel.");
const factory = require("./handelFactory");

const multer = require("multer");
const cloudinary = require("./cloudinary");
const sharp = require("sharp");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an imag please uplaod only image ", 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadImageProduct = upload.array("images", 4);

exports.uploadUsingClodinary = catchAsync(async (req, res, next) => {
  if (!req.files) {
    return next(new AppError("Please upload img", 404));
  }

  // رفع كل صورة إلى Cloudinary والحصول على روابط الصور
  const imageUrls = [];

  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];

    // تعديل حجم الصورة باستخدام Sharp
    const resizedImageBuffer = await sharp(file.buffer)
      .resize(800, 800) // تعديل الحجم (مثال 800x800 بكسل)
      .toBuffer(); // تحويل الصورة المعدلة إلى buffer

    // رفع الصورة إلى Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "image" , folder: 'ecommerce_imgs' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(resizedImageBuffer);
    });

    imageUrls.push(result.secure_url); // حفظ الرابط في المصفوفة
  }

  req.body.images = imageUrls;
  next();
});

// Products Function
exports.getAllProducts = factory.getAll(Product);
exports.createProduct = factory.createOne(Product);

exports.getProduct = factory.getOne(Product, "reviews");

exports.updateProduct = factory.updateOne(Product);

exports.deleteProduct = factory.deleteOne(Product);

// Shop Cart Functions
exports.getShopCart = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: "shopCart",
    select: "name price images",
  });
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
    data: {
      product,
    },
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
    data: {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.images,
    },
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
  const user = await User.findById(req.user.id).populate({
    path: "favorites",
    select: "name price images",
  });
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

// Review Functions
