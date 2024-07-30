const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const addressRoute = require("../controllers/addressController");

// Register - LogIn Routes
router.route("/register").post(authController.register);
router.route("/login").post(authController.login);

// Addresses Routes
router.route("/address").post(authController.auth, addressRoute.addAddress);
router.route("/address").get(authController.auth, addressRoute.getAllAddress);

router
  .route("/address/:addressId")
  .delete(authController.auth, addressRoute.deleteAddress);
router
  .route("/address/:addressId")
  .put(authController.auth, addressRoute.updateAddress);

module.exports = router;
