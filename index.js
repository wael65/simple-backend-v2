const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();

const dbConnection = require("./config/dbConn");
const mongoose = require("mongoose");

const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const corsOptions = require("./config/corsOptions");

// Port
const PORT = process.env.PORT || 5000;

// DB connection
dbConnection();

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Route
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/brand", require("./routes/brandRoutes"));
app.use("/category", require("./routes/categoryRoutes"));
app.use("/product", require("./routes/productRoutes"));
app.use("/wishlist", require("./routes/wishlistRoute"));
app.use("/cart", require("./routes/cartRoute"));

// app listener
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
mongoose.connection.on("error", (err) => {
  console.log(err);
});
