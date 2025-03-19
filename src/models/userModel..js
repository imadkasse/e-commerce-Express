const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, " the name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "the email is required"],
    unique: true,
    validate: [validator.isEmail, "please enter a valid email"],
  },
  password: {
    type: String,
    select: false,
    required: [true, " the password is required"],
    minlength: [8, "the password must be at least 8 characters long"],
  },
  passwordConfirmed: {
    type: String,
    required: [true, "Confirm password is required"],
    minlength: [8, "the password must be at least 8 characters long"],
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "Passwords do not match",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordRestToken: String,
  passwordResetTokenExpires: Date, //ex : 10min for reset the password
  active: {
    type: Boolean,
    default: true,
  },
  favorites: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],
  shopCart: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],
  orders: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Order",
    },
  ],
  role: {
    type: String,
    default: "user",
  },
});
// hash password
userSchema.pre("save", async function (next) {
  // this line run  Only if the password was actually modified
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  // delete the passwordConfirmation
  // تم استخدامه فقط للتحقق من تطابق كلمة المرور أثناء التسجيل أو التحديث.
  this.passwordConfirmed = undefined;
  next();
});

userSchema.pre(/^find/, function (next) {
  if (this.model.modelName === "User") {
    this.populate({
      path: "shopCart",
      select: "name price images",
    })
      .populate({
        path: "favorites",
        select: "name price images",
      })
      .populate("orders");
    this.select("-password");
  }
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordRestToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 600000;

  return resetToken;
};

const User = mongoose.model("user", userSchema);

module.exports = User;
