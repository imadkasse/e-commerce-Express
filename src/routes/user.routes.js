const express = require("express");
const { updatePassword } = require("../controllers/auth.controller");
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  deleteUserByAdmin,
} = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

router.route("/").get(getAllUsers);
router.route("/me").get(getUser);
router.route("/update-user").patch(protect, updateUser);
router.route("/delete-user").delete(protect, deleteUser);

// Update Password
router.route("/update-password").patch(protect, updatePassword);

//ADMIN
router.route("/:id").delete(deleteUserByAdmin);

module.exports = router;
