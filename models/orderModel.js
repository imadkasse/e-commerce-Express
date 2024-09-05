const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  products: [
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

orderSchema.pre("save", async function (next) {
  // Populate productId with name and price fields
  await this.populate({
    path: "products",
    select: "name price",
  });

  // Calculate the total price based on productId prices
  const totalPrice = this.products.reduce(
    (acc, product) => acc + product.price,
    0
  );
  this.price = totalPrice;

  next();
});

orderSchema.pre(/^find/, async function (next) {
  this.populate({
    path: "products",
    select: "name price",
  });
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
