const router = require("express").Router();

const User = require("../model/userModel");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");

////////////////////////////////////////////////////////////
//import module LocalStorage
const { LocalStorage } = require("node-localstorage");
// constructor function to create a storage directory inside our project for all our localStorage setItem.
var localStorage = new LocalStorage("./scratch");
///////////////////////////////////////////////////////

// Calculate the Total Price Of Cart
const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

// Add Product To Cart
router.post("/", async (req, res) => {
  try {
    // cart
    const { productId } = req.body;
    const product = await Product.findById(productId);

    ////////  Get userId From localStorage   //////////
    let userId = localStorage.getItem("userid");
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
          avatar: product.avatar,
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
            avatar: product.avatar,
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

// Get the list of cart items
router.get("/", async (req, res) => {
  try {
    ////////  Get userId From localStorage   //////////
    let userId = localStorage.getItem("userid");
    ///////////////////////////////////////////////////

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
      res.status(404).json({
        status: "Error ",
        messege: `There is no cart for this user id : ${userId} , 404`,
      });
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

// Delete One cart item
router.delete("/:itemId", async (req, res) => {
  ////////  Get userId From localStorage   //////////
  let userId = localStorage.getItem("userid");
  ///////////////////////////////////////////////////
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      {
        $pull: { cartItems: { _id: req.params.itemId } },
      },
      { new: true }
    );

    calcTotalCartPrice(cart);
    await cart.save();

    res.status(200).json({
      status: "success",
      numOfCartItems: cart.cartItems.length,
      data: cart,
    });
  } catch (err) {
    console.log(err);
  }
});

// Delete all cart items
router.delete("/", async (req, res) => {
  ////////  Get userId From localStorage   //////////
  let userId = localStorage.getItem("userid");
  ///////////////////////////////////////////////////
  try {
    await Cart.findOneAndDelete({ user: userId });
    res.status(204).send();
  } catch (err) {
    console.log(err);
  }
});

// Update Quentity of one Cart Item
router.put("/:itemId", async (req, res) => {
  ////////  Get userId From localStorage   //////////
  let userId = localStorage.getItem("userid");
  ///////////////////////////////////////////////////
  try {
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return `there is no cart for user ${userId}`, 404;
    }

    const itemIndex = cart.cartItems.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );

    if (itemIndex > -1) {
      const cartItem = cart.cartItems[itemIndex];
      cartItem.quantity = quantity;
      cart.cartItems[itemIndex] = cartItem;
    } else {
      return next(`there is no item for this id :${req.params.itemId}`, 404);
    }

    calcTotalCartPrice(cart);
    await cart.save();

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
