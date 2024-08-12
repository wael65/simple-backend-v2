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

    // app settings
    const taxPrice = 0;
    const shippingPrice = 60;

    // 1) Get logged user cart
    const cart = await Cart.findById(req.params.cartId);
    if (!cart) {
      `There is no cart for this user :${req.params.cartId}`, 404;
    }
    // console.log(cart);
    console.log(cart);

    // 2) Check if there is coupon apply
    const cartPrice = cart.totalAfterDiscount
      ? cart.totalAfterDiscount
      : cart.totalCartPrice;

    // 3) Create order with default cash option
    const order = await Order.create({
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

// get all orders of user
const getAllUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId });

    if (!orders) {
      `There is no Orders for this user :${userId}`, 404;
    }

    res.status(200).json({
      status: "success",
      data: orders,
    });
  } catch (err) {
    console.log(err);
  }
};

// get all orders - Admin
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    if (!orders) {
      `There is no Orders `, 404;
    }

    res.status(200).json({
      status: "success",
      data: orders,
    });
  } catch (err) {
    console.log(err);
  }
};

// get one order
const getOneOrder = async (req, res) => {
  try {
    // const order = await Order.findOne({ orderId: req.params._id });
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      `There is no Order with this ID :${req.params.orderId}`, 404;
    }

    return res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (err) {
    console.log(err);
  }
};

// delete one order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId);

    if (!order) {
      `There is no Order with this ID :${req.params.orderId}`, 404;
    }

    return res.status(200).json({
      status: "success",
      message: "order removed successfully",
      data: order,
    });
  } catch (err) {
    console.log(err);
  }
};

// update order pay
const updateOrderPay = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      `There is no Order with this ID :${req.params.orderId}`, 404;
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    const updateIsPaid = await order.save();

    return res.status(200).json({
      status: "success",
      message: "Update Order To Paid successfully",
      data: updateIsPaid,
    });
  } catch (err) {
    console.log(err);
  }
};

// update order delevery
const updateOrderDelecery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      `There is no Order with this ID :${req.params.orderId}`, 404;
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updateIsDeleverd = await order.save();

    return res.status(200).json({
      status: "success",
      message: "Update Order To Paid successfully",
      data: updateIsDeleverd,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createCashOrder,
  getAllUserOrders,
  getAllOrders,
  deleteOrder,
  getOneOrder,
  updateOrderPay,
  updateOrderDelecery,
};
