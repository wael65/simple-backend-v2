const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

////////////////////////////////////////////////////////////
//import module LocalStorage
const { LocalStorage } = require("node-localstorage");

// constructor function to create a storage directory inside our project for all our localStorage setItem.
var localStorage = new LocalStorage("./scratch");

///////////////////////////////////////////////////////

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  const foundUser = await User.findOne({ email }).exec(); //git user from DB

  if (foundUser) {
    return res.status(401).json({ msg: "User already exists" });
  }

  //hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  //create new user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Create accessToken
  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: user._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  // Create refreshToken
  const refreshToken = jwt.sign(
    {
      UserInfo: {
        id: user._id,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // store refreshToken in cookie
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({
    accessToken,
    email: user.email,
    name: user.name,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  const foundUser = await User.findOne({ email }).exec(); //git user from DB

  if (!foundUser) {
    return res.status(401).json({ msg: "User dose not exist" });
  }

  console.log(foundUser.id);

  //compare input passowrd with stored password
  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) {
    return res.status(401).json({ msg: "Incorrect password" });
  }
  // Create accessToken
  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: foundUser._id,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  // Create refreshToken
  const refreshToken = jwt.sign(
    {
      UserInfo: {
        id: foundUser._id,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // store refreshToken in cookie
  res.cookie("jwt", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // store userId in cookie
  res.cookie("userId", foundUser.id, {
    httpOnly: true, //accessible only by web server
    secure: true, //https
    sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  localStorage.setItem("userid", foundUser.id);

  res.json({
    accessToken,
    id: foundUser.id,
    email: foundUser.email,
    name: foundUser.name,
  });
};

const auth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log(token);
  }
  if (!token) {
    return "You are not logged in. Please login to get access", 401;
  }
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  console.log(decoded);

  // 3- Check the user exists
  const currentUser = await User.findById(decoded.UserInfo.id);
  if (!currentUser) {
    console.log("The user that belong to this token does no longer exist");
  }
  console.log("Done");
  req.user = currentUser;
  next();
};

module.exports = { register, login, auth };
