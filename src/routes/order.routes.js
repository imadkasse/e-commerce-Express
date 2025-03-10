const express = require("express");
const { permissionAdmin, protect } = require("../middlewares/auth.middleware");

const {
  addOrder,
  removeOrder,
  getAllOrders,
  updateOrder,
  getAllOrdersByUser,
} = require("../controllers/order.controller");

const router = express.Router();

router.route("/").post(protect, addOrder).get(permissionAdmin, getAllOrders);

router.route("/:id").delete(protect, removeOrder).patch(protect, updateOrder);

router.route("/orderByUser").get(protect, getAllOrdersByUser);

module.exports = router;
