const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
      // trim: true,
    },
    description: {
      type: String,
      // required: [true, "Product description is required"],
      maxlength: [2000, "Too long description"],
    },
    quantity: {
      type: Number,
      // required: [true, "Product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      // required: [true, "Product price is required"],
      trim: true,
      maxlength: [32, "To long price"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
    },
    cloudinary_id: {
      type: String,
      required: false,
    },
    category_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: false,
    },
    brand_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Brand",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
