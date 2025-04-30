const express = require("express");
const cors = require("cors");
const connectDB = require("./utils/connectDB.js");
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  
  res.json({
    message: error.message || "Something went wrong!",
    status: error.status,
    stack: error.stack,
  });
});
  
app.listen(3000, () => {
  connectDB();
  console.log("Server is running!");
});