const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.");

exports.protect = catchAsync(async (req, res, next) => {
  //1) check if token is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("You are not logged in", 401));
  }
  // 2)  verification  token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3)  check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  // 4)  check if user changed password after token was issued
  if (await currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password. Please login again.", 401)
    );
  }

  //5) generate token
  req.user = currentUser;
  next();
});

exports.permissionAdmin = catchAsync(async (req, res, next) => {
  // Check token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("You are not logged in", 401));
  }
  //
  // 2)  verification  token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3)  check if user still exists
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );
  }

  if (user.role !== "admin") {
    return next(
      new AppError("You do not have permission to access this route", 403)
    );
  }

  next();
});
