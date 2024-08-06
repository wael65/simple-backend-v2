const router = require("express").Router();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Brand = require("../model/brandModel");

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

// Get Brand By ID
router.get("/:id", async (req, res) => {
  try {
    // Find Brand by id
    let brand = await Brand.findById(req.params.id);
    res.json(brand);
  } catch (err) {
    console.log(err);
  }
});

// Delete Brand By ID
router.delete("/:id", async (req, res) => {
  try {
    // Find user by id
    let brand = await Brand.findById(req.params.id);
    // // Delete image from cloudinary
    await cloudinary.uploader.destroy(brand.cloudinary_id);
    // Delete user from db
    await brand.deleteOne();
    res.json(brand);
  } catch (err) {
    console.log(err);
  }
});

// Update Brand By ID
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    let brand = await Brand.findById(req.params.id);

    if ("image" !== "") {
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(brand.cloudinary_id);
      // Upload image to cloudinary
      let result;
      if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
      }
      const data = {
        name: req.body.name || brand.name,
        avatar: result?.secure_url || brand.avatar,
        cloudinary_id: result?.public_id || brand.cloudinary_id,
      };
      brand = await Brand.findByIdAndUpdate(req.params.id, data, { new: true });
      res.json(brand);
    } else {
      const data = {
        name: req.body.name || brand.name,
      };
      brand = await Brand.findByIdAndUpdate(req.params.id, data, { new: true });
      res.json(brand);
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
