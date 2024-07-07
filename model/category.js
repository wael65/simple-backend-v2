const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
      // trim: true,
    },
    avatar: {
      type: String,
    },
    cloudinary_id: {
      type: String,
      // required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
