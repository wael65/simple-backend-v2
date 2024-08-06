const router = require("express").Router();

const User = require("../model/userModel");

////////////////////////////////////////////////////////////
//import module LocalStorage
const { LocalStorage } = require("node-localstorage");

// constructor function to create a storage directory inside our project for all our localStorage setItem.
var localStorage = new LocalStorage("./scratch");

///////////////////////////////////////////////////////

// Add item to wishlist
router.post("/", async (req, res) => {
  try {
    let userId = localStorage.getItem("userid");

    console.log(userId);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { wishlist: req.body.productId },
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Product added successfully to your wishlist.",
      data: user.wishlist,
    });
  } catch (err) {
    console.log(err);
  }
});

// Get logged user wishlist
router.get("/", async (req, res, next) => {
  let userId = localStorage.getItem("userid");

  const user = await User.findById(userId).populate("wishlist");

  res.status(200).json({
    status: "success",
    results: user.wishlist.length,
    data: user.wishlist,
  });
});

// Delete item from wishlist By ID
router.delete("/:id", async (req, res) => {
  let userId = localStorage.getItem("userid");

  // $pull => remove productId from wishlist array if productId exist
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $pull: { wishlist: req.params.id },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product removed successfully from your wishlist.",
    data: user.wishlist,
  });
});

module.exports = router;
