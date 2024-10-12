const express = require("express");

const { protect, permissionAdmin } = require("../controllers/authController");
const {
  addOrder,
  removeOrder,
  getAllOrders,
  updateOrder,
  getAllOrdersByUser,
} = require("../controllers/orderController");

const router = express.Router();

router.route("/").post(protect, addOrder).get(permissionAdmin, getAllOrders);

router.route("/:id").delete(protect, removeOrder).patch(protect, updateOrder);

router.route("/orderByUser").get(protect, getAllOrdersByUser);

module.exports = router;
