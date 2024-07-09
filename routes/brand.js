const router = require("express").Router();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Brand = require("../model/brand");

// Add a New User
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    res.json(result);

    // Create new user
    let brand = new Brand({
      name: req.body.name,
      avatar: result.secure_url,
      cloudinary_id: result.public_id,
    });
    // // Save Brand
    await brand.save();
    res.json(brand);
  } catch (err) {
    console.log(err);
  }
});

// Get All Brand
router.get("/", async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;

  // Get the search term from the query string
  const { name } = req.query;
  console.log(req.query);

  // Calculate the start and end indexes for the requested page
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // Perform the search using regular expressions for flexible matching
  const regex = new RegExp(name, "i"); // Case-insensitive search

  try {
    let brand = await Brand.find({ name: { $regex: regex } });

    // Slice the Brand array based on the indexes
    const paginatedBrand = brand.slice(startIndex, endIndex);

    // Calculate the total number of pages
    const totalItems = Math.ceil(brand.length);
    const totalPages = Math.ceil(brand.length / limit);

    // Send the paginated Brand and total pages as the API response
    res.json({
      totalPages,
      totalItems,
      page,
      result: paginatedBrand.length,
      brand: paginatedBrand,
    });
  } catch (err) {
    console.log(err);
  }
});

// // Get User By ID
// router.get("/:id", async (req, res) => {
//   try {
//     // Find user by id
//     let user = await User.findById(req.params.id);
//     res.json(user);
//   } catch (err) {
//     console.log(err);
//   }
// });

// // Delete User By ID
// router.delete("/:id", async (req, res) => {
//   try {
//     // Find user by id
//     let user = await User.findById(req.params.id);
//     // // Delete image from cloudinary
//     await cloudinary.uploader.destroy(user.cloudinary_id);
//     // Delete user from db
//     await user.deleteOne();
//     res.json(user);
//   } catch (err) {
//     console.log(err);
//   }
// });

// // Update User By ID
// router.put("/:id", upload.single("image"), async (req, res) => {
//   try {
//     let user = await User.findById(req.params.id);
//     // Delete image from cloudinary
//     await cloudinary.uploader.destroy(user.cloudinary_id);
//     // Upload image to cloudinary
//     let result;
//     if (req.file) {
//       result = await cloudinary.uploader.upload(req.file.path);
//     }
//     const data = {
//       name: req.body.name || user.name,
//       avatar: result?.secure_url || user.avatar,
//       cloudinary_id: result?.public_id || user.cloudinary_id,
//     };
//     user = await User.findByIdAndUpdate(req.params.id, data, { new: true });
//     res.json(user);
//   } catch (err) {
//     console.log(err);
//   }
// });

module.exports = router;
