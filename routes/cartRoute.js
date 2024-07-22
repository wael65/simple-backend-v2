const router = require("express").Router();

const User = require("../model/User");
const Product = require("../model/product");
const Cart = require("../model/cartModel");

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

router.post("/", async (req, res) => {
  try {
    // cart
    const { productId } = req.body;
    const product = await Product.findById(productId);

    ///////////////////////////////////////////////////
    // wish
    console.log(req.cookies);

    const userId = req.cookies.userId;

    console.log(userId);
    console.log(req.cookies.userId);

    ///////////////////////////////////////////////////
    // cart
    // 1) Get Cart for logged user
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      // create cart fot logged user with product
      cart = await Cart.create({
        user: userId,
        cartItems: [{ product: productId, price: product.price }],
      });
    } else {
      // product exist in cart, update product quantity
      const productIndex = cart.cartItems.findIndex(
        (item) => item.product.toString() === productId
      );
      if (productIndex > -1) {
        const cartItem = cart.cartItems[productIndex];
        cartItem.quantity += 1;

        cart.cartItems[productIndex] = cartItem;
      } else {
        // product not exist in cart,  push product to cartItems array
        cart.cartItems.push({
          product: productId,
          color,
          price: product.price,
        });
      }
    }

    // Calculate total cart price
    calcTotalCartPrice(cart);
    await cart.save();

    ///////////////////////////////////////////////////
    //wish-token
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
        $addToSet: { cart: req.body.productId },
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Product added successfully to your cart.",
      data: user.cart,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
