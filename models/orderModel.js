const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  productId: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  ],

  date: {
    type: Date,
    default: Date.now(),
  },
  price: {
    type: Number,
  },
  codePromo: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    required: true,
  },
});

orderSchema.pre("save", function (next) {
  this.populate({
    path: "productId",
    select: "name price",
  });
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
