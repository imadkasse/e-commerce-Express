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
    message: "Order added ",
    data: {
      orders: user.orders,
    },
  });
});
