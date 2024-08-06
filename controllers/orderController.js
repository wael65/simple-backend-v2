const router = require("express").Router();

const User = require("../model/userModel");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const Order = require("../model/orderModel");

////////////////////////////////////////////////////////////
//import module LocalStorage
const { LocalStorage } = require("node-localstorage");
// constructor function to create a storage directory inside our project for all our localStorage setItem.
var localStorage = new LocalStorage("./scratch");
///////////////////////////////////////////////////////

// create new order
const createCashOrder = async (req, res) => {
  ////////  Get userId From localStorage   //////////
  let userId = localStorage.getItem("userid");
  ///////////////////////////////////////////////////
  try {
    console.log(req.params.cartId);
    console.log(userId);
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
      //   user: req.user._id,
      user: userId,
      cartItems: cart.cartItems,
      shippingAddress: req.body.shippingAddress,
      totalOrderPrice: taxPrice + shippingPrice + cartPrice,
    });

    // 4) After creating order decrement product quantity, increment sold
    // Performs multiple write operations with controls for order of execution.
    if (order) {
      const bulkOption = cart.cartItems.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
        },
      }));

      await Product.bulkWrite(bulkOption, {});

      // 5) Clear cart
      await Cart.findByIdAndDelete(req.params.cartId);
    }

    res.status(201).json({ status: "success", data: order });
  } catch (err) {
    console.log(err);
  }
};

// get all orders
const getAllOrders = async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
  }
};

// get one order
const getOneOrder = async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
  }
};

// delet one order
const deleteOrder = async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
  }
};

// update one order
const updateOrder = async (req, res) => {
  try {
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createCashOrder,
  getAllOrders,
  deleteOrder,
  getOneOrder,
  updateOrder,
};
