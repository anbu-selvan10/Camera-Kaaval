const mongoose = require("mongoose");
require('dotenv').config()

const mongoUrl = process.env.MONGODB_URI;

console.log(mongoUrl);

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Database connected");
  })
  .catch((e) => {
    console.log(e);
  });

module.exports=mongoose