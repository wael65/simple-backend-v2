const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.route("/register").post(authController.register);
router.route("/login").post(authController.login);
router.route("/address").post(authController.authAddress);
router.route("/auth").post(authController.auth);

module.exports = router;
