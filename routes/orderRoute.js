const express = require("express");

const { protect } = require("../controllers/authController");
const {
  addOrder,
  removeOrder,
  getAllOrders,
  updateOrder,
} = require("../controllers/orderController");

const router = express.Router();

router.route("/").post(protect, addOrder).get(protect, getAllOrders);

router.route("/:id").delete(protect, removeOrder).patch(protect, updateOrder);

module.exports = router;
