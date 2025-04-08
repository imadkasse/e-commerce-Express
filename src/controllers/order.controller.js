const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeaturs");
const Order = require("../models/orderModel");
const User = require("../models/userModel.");
const Product = require("../models/productModel");

exports.getAllOrdersByUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("orders");
  const orders = user.orders;

  res.status(200).json({
    status: "success",
    message: "Order added",
    orders: orders,
  });
});

exports.addOrder = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError("User not found with that Id", 404));
  }

  // تحديث عدد الشراء لكل منتج
  await Promise.all(
    req.body.products.map(async (id) => {
      const product = await Product.findById(id);
      product.totalPurchased++;
      await product.save();
    })
  );

  const newOrder = await Order.create({
    ...req.body,
    username: user.username,
    email: user.email,
  });

  await User.findByIdAndUpdate(req.user.id, {
    $push: { orders: newOrder._id },
  });

  res.status(201).json({
    status: "success",
    message: "Order added",
  });
});

exports.removeOrder = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, {
    $pull: { orders: req.params.id },
  });
  if (!user) {
    return next(new AppError("User not found with that Id", 404));
  }
  const oreder = await Order.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    message: "Order removed",
    data: null,
  });
});

exports.updateOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!order) {
    return next(new AppError("Order not found with that Id", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Order updated",
    data: {
      order,
    },
  });
});

// ADMIN

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Order.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const orders = await features.query;
  console.log(orders);
  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});
