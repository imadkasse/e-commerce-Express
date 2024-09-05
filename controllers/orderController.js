const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeaturs");
const Order = require("../models/orderModel");
const User = require("../models/userModel.");

exports.addOrder = catchAsync(async (req, res, next) => {
  const newOrder = await Order.create(req.body);
  const user = await User.findByIdAndUpdate(req.user.id, {
    $push: { orders: newOrder._id },
  });
  if (!user) {
    return next(new AppError("User not found with that Id", 404));
  }
  res.status(200).json({
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

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});
