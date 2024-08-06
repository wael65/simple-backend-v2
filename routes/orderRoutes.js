const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");

// add new order
router.post("/", async (req, res) => {
  try {
    // app settings
    const taxPrice = 0;
    const shippingPrice = 0;

    // 1) Get logged user cart
    const cart = await Cart.findById(req.params.cartId);
    if (!cart) {
      `There is no cart for this user :${req.user._id}`, 404;
    }

    // 2) Check if there is coupon apply
    const cartPrice = cart.totalAfterDiscount
      ? cart.totalAfterDiscount
      : cart.totalCartPrice;

    // 3) Create order with default cash option
    const order = await Order.create({
      user: req.user._id,
      cartProducts: cart.cartItems,
      shippingAddress: req.body.shippingAddress,
      totalOrderPrice: taxPrice + shippingPrice + cartPrice,
    });

    // 4) After creating order decrement product quantity, increment sold
    // Performs multiple write operations with controls for order of execution.
    if (order) {
      const bulkOption = cart.products.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      }));

      await Product.bulkWrite(bulkOption, {});

      // 5) Clear cart
      await Cart.findByIdAndDelete(req.params.cartId);
    }
  } catch (err) {
    console.log(err);
  }
});

// get all orders
router.get("/", async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
  }
});

// get one order
router.get("/:id", async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
  }
});

// delet one order
router.delet("/:id", async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
  }
});

// update one order
router.put("/:id", async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
  }
});
