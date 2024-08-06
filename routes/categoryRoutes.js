const router = require("express").Router();
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Category = require("../model/categoryModel");

// Add a New category
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    res.json(result);

    // Create new category
    let category = new Category({
      name: req.body.name,
      avatar: result.secure_url,
      cloudinary_id: result.public_id,
    });
    // // Save user
    await category.save();
    res.json(category);
  } catch (err) {
    console.log(err);
  }
});

// Get All Category
router.get("/", async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 4;

  // Get the search term from the query string
  const { name } = req.query;
  console.log(req.query);

  // Calculate the start and end indexes for the requested page
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // Perform the search using regular expressions for flexible matching
  const regex = new RegExp(name, "i"); // Case-insensitive search

  try {
    let category = await Category.find({ name: { $regex: regex } });

    // Slice the category array based on the indexes
    const paginatedCategory = category.slice(startIndex, endIndex);

    // Calculate the total number of pages
    const totalItems = Math.ceil(category.length);
    const totalPages = Math.ceil(category.length / limit);

    // Send the paginated category and total pages as the API response
    res.json({
      totalPages,
      totalItems,
      page,
      result: paginatedCategory.length,
      category: paginatedCategory,
    });
  } catch (err) {
    console.log(err);
  }
});

// Get Category By ID
router.get("/:id", async (req, res) => {
  try {
    // Find Category by id
    let category = await Category.findById(req.params.id);
    res.json(category);
  } catch (err) {
    console.log(err);
  }
});

// Delete category By ID
router.delete("/:id", async (req, res) => {
  try {
    // Find category by id
    let category = await Category.findById(req.params.id);
    // // Delete image from cloudinary
    await cloudinary.uploader.destroy(category.cloudinary_id);
    // Delete user from db
    await category.deleteOne();
    res.json(category);
  } catch (err) {
    console.log(err);
  }
});

// Update Category By ID
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if ("image" !== "") {
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(category.cloudinary_id);

      // Upload image to cloudinary
      let result;
      if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
      }
      const data = {
        name: req.body.name || category.name,
        avatar: result?.secure_url || category.avatar,
        cloudinary_id: result?.public_id || category.cloudinary_id,
      };
      category = await Category.findByIdAndUpdate(req.params.id, data, {
        new: true,
      });
      res.json(category);
    } else {
      const data = {
        name: req.body.name || category.name,
      };
      category = await Category.findByIdAndUpdate(req.params.id, data, {
        new: true,
      });
      res.json(category);
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
