const router = require("express").Router();

const User = require("../model/User");

router.post("/", async (req, res) => {
  try {
    console.log(req.cookies);

    const userId = req.cookies.userId;

    console.log(userId);
    console.log(req.cookies.userId);

    ///////////////////////////////////////////////////

    // 1) Check if token exist, if exist get
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
      console.log(token);
    }
    if (!token) {
      return "You are not login, Please login to get access this route", 401;
    }

    //////////////////////////////////////////////////////////////////////
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

module.exports = router;
