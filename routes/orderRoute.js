const express = require("express");

const { protect } = require("../controllers/authController");
const { addOrder } = require("../controllers/orderController");

const router = express.Router();

router.route("/").post(protect, addOrder);

module.exports = router;
