const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
    { expiresIn: "1h" }
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
    { expiresIn: "1h" }
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

  res.json({
    accessToken,
    id: foundUser.id,
    email: foundUser.email,
    name: foundUser.name,
  });
};

module.exports = { register, login };
