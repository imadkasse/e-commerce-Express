const express = require("express");
const {
  signup,
  login,
  protect,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

//auth
router.post("/signup", signup);
router.post("/login", login);

//forgot password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.route("/").get(getAllUsers);
router.route("/:id").get(getUser);
router.route("/update-user").patch(protect, updateUser);
router.route("/delete-user").delete(protect, deleteUser);

module.exports = router;
