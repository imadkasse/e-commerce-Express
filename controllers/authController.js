const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");
const User = require("./../models/userModel.");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign(
    { id }, // 1. تمرير بيانات المستخدم (في هذه الحالة المعرف الخاص بالمستخدم "id" وهو _id من قاعدة البيانات) كجزء من الحمولة "payload" في الرمز JWT.
    process.env.JWT_SECRET, // 2. المفتاح السري "JWT_SECRET" الذي يتم استخدامه لتوقيع الرمز JWT. يجب أن يكون هذا المفتاح قويًا ويُخزن في متغير بيئي (بيئة آمنة).
    {
      expiresIn: process.env.JWT_EXPIRES_IN, // 3. مدة انتهاء الصلاحية "expiresIn" تُحدد فترة صلاحية الرمز JWT. هذا المتغير أيضًا مخزن في البيئة لتحديد المدة (مثل "1h" لساعة أو "7d" لسبعة أيام).
    }
  );
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);

  // إعداد الكوكي مع HttpOnly
  res.cookie("token", token, {
    httpOnly: true, // الكوكي يكون HttpOnly مما يمنع الوصول من JavaScript
    secure: false, // فقط في HTTPS إذا كنت في بيئة الإنتاج
    maxAge: 24 * 60 * 60 * 1000, // مدة صلاحية الكوكي (24 ساعة)
    sameSite: "Strict", // حماية ضد هجمات CSRF
  });

  res.status(200).json({
    status: statusCode,
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirmed: req.body.passwordConfirmed,
  });

  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  //1) take username and password from user
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("The email and password are not provided ", 400));
  }

  //2) find user by username
  const user = await User.findOne({ email }).select("+password");

  //3 compare password
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect username or password", 401));
  }
  //4) if password is correct, generate token and send it back to user
  createAndSendToken(user, 200, res);
});

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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("No user found with that email", 404));
  }
  //2) generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // Save the user document without validating the data
  //3) send it  to user's email
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v2003/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request  with your new password and PasswordConfirm to:${resetUrl}\n
    If you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password reset token (valid for 10 minutes) ",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Reset password email sent. Please check your inbox.",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false }); // Save the user document without validating the data
    return next(
      new AppError("There was an error sending email. Try again later.", 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user by token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex"); // Get current date and time

  const user = await User.findOne({
    passwordRestToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("Invalid token or token expired", 400));
  }
  //2) set new password and update passwordResetToken and expires
  user.password = req.body.password;
  user.passwordConfirmed = req.body.passwordConfirmed;
  user.passwordRestToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne(req.user.id).select("+password");
  //1) check if old password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Incorrect current password", 401));
  }
  //2) update password
  user.password = req.body.password;
  user.passwordConfirmed = req.body.passwordConfirmed;
  await user.save();

  createAndSendToken(user, 200, res);
});
