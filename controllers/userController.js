const User = require("../models/userModel.");
const APIFeatures = require("../utils/apiFeaturs");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");

const fileterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  // const user = await User.findById(req.params.id);
  // if (!user) {
  //   return next(new AppError("User not found with that Id ", 404));
  // }
  // res.status(200).json({
  //   status: "success",
  //   data: {
  //     user,
  //   },
  // });

  // استخراج الـ token من الـ headers
  const token = req.headers.authorization?.split(" ")[1]; // إزالة "Bearer" من الترويسة

  if (!token) {
    return next(new AppError("Token not provided", 401));
  }

  // التحقق من الـ token واستخراج الـ id من الـ payload
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET); // افترض أن مفتاح التوقيع في JWT موجود في المتغيرات البيئية
  } catch (err) {
    return next(new AppError("Invalid token", 401));
  }

  // البحث عن المستخدم بناءً على الـ id المستخرج من الـ token
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError("User not found with that ID", 404));
  }

  // إذا تم العثور على المستخدم، إعادة البيانات
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  //1) create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirmation) {
    return next(
      new AppError(
        "This route does not allow password updates, Please use /updateMyPassword",
        400
      )
    );
  }
  //2) filter out unwanted fields
  const filteredBody = fileterObj(req.body, "username", "email");

  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });
  res.status(204).json({
    status: "success",
  });
});

//ADMIN
exports.deleteUserByAdmin = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    message: "User removed",
    data: null,
  });
});
