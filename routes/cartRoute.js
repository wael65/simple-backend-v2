const router = require("express").Router();

const User = require("../model/User");
const Product = require("../model/product");
const Cart = require("../model/cartModel");

////////////////////////////////////////////////////////////
//import module LocalStorage
const { LocalStorage } = require("node-localstorage");

// constructor function to create a storage directory inside our project for all our localStorage setItem.
var localStorage = new LocalStorage("./scratch");

///////////////////////////////////////////////////////
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

    let userId = localStorage.getItem("userid");
    console.log(userId);

    ///////////////////////////////////////////////////
    // cart
    // 1) Get Cart for logged user
    let cart = await Cart.findOne({ user: userId });

    if (cart) {
      // product exist in cart, update product quantity
      const productIndex = cart.cartItems.findIndex(
        (p) => p.product.toString() === req.body.productId
      );
      if (productIndex > -1) {
        const cartItem = cart.cartItems[productIndex];
        cartItem.quantity += 1;

        cart.cartItems[productIndex] = cartItem;
      } else {
        // product not exist in cart,  push product to cartItems array
        cart.cartItems.push({
          product: productId,
          price: product.price,
          name: product.name,
          description: product.description,
        });
      }
    }

    if (!cart) {
      // create cart fot logged user with product
      cart = await Cart.create({
        user: userId,
        cartItems: [
          {
            product: productId,
            price: product.price,
            name: product.name,
            description: product.description,
          },
        ],
      });
    }

    // Calculate total cart price
    calcTotalCartPrice(cart);
    await cart.save();

    res.status(200).json({
      status: "success",
      message: "Product added successfully to your cart.",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/", async (req, res) => {
  try {
    let userId = localStorage.getItem("userid");

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "cartItems.product",
        select: "title imageCover ratingsAverage brand category ",
        populate: { path: "brand_id", select: "name -_id", model: "Brand" },
      })
      .populate({
        path: "cartItems.product",
        select: "title imageCover ratingsAverage brand category",
        populate: {
          path: "category_id",
          select: "name -_id",
          model: "Category",
        },
      });

    if (!cart) {
      return `There is no cart for this user id : ${userId}`, 404;
    }

    res.status(200).json({
      status: "success",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
