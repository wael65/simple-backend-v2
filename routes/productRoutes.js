const router = require("express").Router();

const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const Product = require("../model/productModel");

// Add a New product
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    res.json(result);

    // Create new product
    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      quantity: req.body.quantity,
      sold: req.body.sold,
      price: req.body.price,
      priceAfterDiscount: req.body.priceAfterDiscount,
      ratingsQuantity: req.body.ratingsQuantity,
      avatar: result.secure_url,
      cloudinary_id: result.public_id,
      category_id: req.body.category_id,
      brand_id: req.body.brand_id,
    });
    // // Save product
    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
  }
});

// Get All products
router.get("/all", async (req, res) => {
  // Get the search term from the query string
  const { name } = req.query;
  console.log(req.query);
  const regex = new RegExp(name, "i"); // Case-insensitive search

  try {
    let product = await Product.find({ name: { $regex: regex } })
      .populate({
        path: "category_id",
        select: "name",
      })
      .populate({
        path: "brand_id",
        select: "name",
      });

    res.json({
      result: product.length,
      product: product,
    });
  } catch (err) {
    console.log(err);
  }
});

// Get All products with pagination
// Route to handle pagination requests
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;

  // // Get the search term from the query string
  const { name } = req.query;
  // console.log(req.query);

  // Calculate the start and end indexes for the requested page
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // // Perform the search using regular expressions for flexible matching
  const regex = new RegExp(name, "i"); // Case-insensitive search

  try {
    let product = await Product.find({ name: { $regex: regex } })
      // let product = await Product.find(req.query)
      .populate({
        path: "category_id",
        select: "name",
      })
      .populate({
        path: "brand_id",
        select: "name",
      });

    // Slice the products array based on the indexes
    const paginatedProducts = product.slice(startIndex, endIndex);

    // Calculate the total number of pages
    const totalItems = Math.ceil(product.length);
    const totalPages = Math.ceil(product.length / limit);

    // Send the paginated products and total pages as the API response
    res.json({
      totalPages,
      totalItems,
      page,
      result: paginatedProducts.length,
      product: paginatedProducts,
    });
  } catch (err) {
    console.log(err);
  }
});

// Get product By ID
router.get("/:id", async (req, res) => {
  try {
    // Find product by id
    let product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    console.log(err);
  }
});

// Delete product By ID
router.delete("/:id", async (req, res) => {
  try {
    // Find user by id
    let product = await Product.findById(req.params.id);
    // // Delete image from cloudinary
    await cloudinary.uploader.destroy(product.cloudinary_id);
    // Delete user from db
    await product.deleteOne();
    res.json(product);
  } catch (err) {
    console.log(err);
  }
});

// Update product By ID
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if ("image" !== "") {
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(product.cloudinary_id);
      // Upload image to cloudinary
      let result;
      if (req.file) {
        result = await cloudinary.uploader.upload(req.file.path);
      }
      const data = {
        name: req.body.name || product.name,
        description: req.body.description || product.description,
        quantity: req.body.quantity || product.quantity,
        sold: req.body.sold || product.sold,
        price: req.body.price || product.price,
        priceAfterDiscount:
          req.body.priceAfterDiscount || product.priceAfterDiscount,
        ratingsQuantity: req.body.ratingsQuantity || product.ratingsQuantity,
        category_id: req.body.category_id || product.category_id,
        brand_id: req.body.brand_id || product.brand_id,
        avatar: result?.secure_url || product.avatar,
        cloudinary_id: result?.public_id || product.cloudinary_id,
      };
      product = await Product.findByIdAndUpdate(req.params.id, data, {
        new: true,
      });
      res.json(product);
    } else {
      const data = {
        name: req.body.name || product.name,
        description: req.body.description || product.description,
        quantity: req.body.quantity || product.quantity,
        sold: req.body.sold || product.sold,
        price: req.body.price || product.price,
        priceAfterDiscount:
          req.body.priceAfterDiscount || product.priceAfterDiscount,
        ratingsQuantity: req.body.ratingsQuantity || product.ratingsQuantity,
        category_id: req.body.category_id || product.category_id,
        brand_id: req.body.brand_id || product.brand_id,
      };
      product = await Product.findByIdAndUpdate(req.params.id, data, {
        new: true,
      });
      res.json(product);
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
