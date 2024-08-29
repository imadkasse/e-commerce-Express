const express = require("express");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  addProduct,
  removeProduct,
  getShopCart,
  clearCart,
  addProductToFav,
  removeProductFromFav,
  getFavorite,
  clearFav,
} = require("../controllers/productController");
const { protect } = require("../controllers/authController");

const router = express.Router();

// Routes
router.route("/").get(getAllProducts).post(createProduct);
router.route("/:id").patch(updateProduct).delete(deleteProduct).get(getProduct);

router
  .route("/shopCart/allItems")
  .get(protect, getShopCart)
  .post(protect, clearCart);

router
  .route("/shopCart/:id")
  .post(protect, addProduct)
  .delete(protect, removeProduct);

router
  .route("/favorite/allItems")
  .get(protect, getFavorite)
  .delete(protect, clearFav);

router
  .route("/favorite/:id")
  .post(protect, addProductToFav)
  .delete(protect, removeProductFromFav);

module.exports = router;
