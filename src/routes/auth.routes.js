const express = require("express");
const { signup, login, forgotPassword, resetPassword } = require("../controllers/auth.controller");

const router = express.Router();

//auth
router.post("/signup", signup);
router.post("/login", login);

//forgot password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
