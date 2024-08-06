const express = require("express");
const router = express.Router();
// const cloudinary = require("../utils/cloudinary");
// const upload = require("../utils/multer");
const usersController = require("../controllers/usersController");
const User = require("../model/userModel");

// Get All Users
router.route("/").get(usersController.getAllUsers);

// Get User By ID
router.get("/:id", async (req, res) => {
  try {
    // Find user by id
    let user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    console.log(err);
  }
});

// Delete User By ID
router.delete("/:id", async (req, res) => {
  try {
    // Find user by id
    let user = await User.findById(req.params.id);

    // // Delete image from cloudinary
    // await cloudinary.uploader.destroy(user.cloudinary_id);

    // Delete user from db
    await user.deleteOne();
    res.json(user);
  } catch (err) {
    console.log(err);
  }
});

// Update User By ID
// router.put("/:id", upload.single("image"), async (req, res) => {
router.put("/:id", async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    // // Delete image from cloudinary
    // await cloudinary.uploader.destroy(user.cloudinary_id);
    // // Upload image to cloudinary
    // let result;
    // if (req.file) {
    //   result = await cloudinary.uploader.upload(req.file.path);
    // }
    // const data = {
    //   name: req.body.name || user.name,
    //   avatar: result?.secure_url || user.avatar,
    //   cloudinary_id: result?.public_id || user.cloudinary_id,
    // };
    const data = {
      name: req.body.name || user.name,
    };
    user = await User.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(user);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
