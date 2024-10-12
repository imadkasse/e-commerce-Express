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
  status: {
    type: String,
    default: "on delivery",
    validate: {
      validator: function (value) {
        return ["on delivery", "Delivered", "In the warehouse"].includes(value);
      },
      message: "value do not match",
    },
  },
});

orderSchema.pre("save", async function (next) {
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
  this.populate([
    {
      path: "products",
      select: "name price",
    },
  ]);
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
