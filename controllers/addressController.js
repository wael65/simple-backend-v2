const User = require("../model/userModel");

////////////////////////////////////////////////////////////
//import module LocalStorage
const { LocalStorage } = require("node-localstorage");
// constructor function to create a storage directory inside our project for all our localStorage setItem.
var localStorage = new LocalStorage("./scratch");
///////////////////////////////////////////////////////

// Add address
const addAddress = async (req, res) => {
  try {
    ////////  Get userId From localStorage   //////////
    let userId = localStorage.getItem("userid");
    ///////////////////////////////////////////////////

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { addresses: req.body },
      },
      { new: true }
    );

    res.status(200).json({
      status: "success",
      message: "Product added successfully to your wishlist.",
      data: user.addresses,
    });
  } catch (err) {
    console.log(err);
  }
};

// Get All User Addresses
const getAllAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("addresses")
      .populate("addresses");

    res.status(200).json({
      results: user.addresses.length,
      status: "success",
      data: user.addresses,
    });
  } catch (err) {
    console.log(err);
  }
};

// Delete Address
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    console.log(addressId);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          addresses: { _id: addressId },
        },
      },
      { new: true }
    );

    return res.status(200).json({
      status: "success",
      message: "Address removed successfully",
      data: user.addresses,
    });
  } catch (err) {
    console.log(err);
  }
};

// get one Address
const getOneAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);

    return res.status(200).json({
      status: "success",
      data: address,
    });
  } catch (err) {
    console.log(err);
  }
};

// Update Address
const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(req.params.addressId);

    address.alias = req.body.alias || address.alias;
    address.details = req.body.details || address.details;
    address.phone = req.body.phone || address.phone;
    address.city = req.body.city || address.city;
    address.postalCode = req.body.postalCode || address.postalCode;

    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Address updated successfully",
      data: address,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  addAddress,
  getAllAddress,
  deleteAddress,
  getOneAddress,
  updateAddress,
};
