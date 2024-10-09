const express = require("express");
const {
  signup,
  login,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require("../controllers/authController");
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  deleteUserByAdmin,
} = require("../controllers/userController");

const router = express.Router();

//auth
router.post("/signup", signup);
router.post("/login", login);

//forgot password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.route("/").get(getAllUsers);
router.route("/data-user").get(getUser);
router.route("/update-user").patch(protect, updateUser);
router.route("/delete-user").delete(protect, deleteUser);

// Update Password
router.route("/update-password").patch(protect, updatePassword);

//ADMIN
router.route("/:id").delete(deleteUserByAdmin);

module.exports = router;
