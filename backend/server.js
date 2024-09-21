require('dotenv').config({ path: "../.env" })
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(cors());

const mongoUrl = process.env.MONGODB_URI;

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log("Database connected");
  })
  .catch((e) => {
    console.log(e);
  });

require("./models/UserDetails.js");

const User = mongoose.model("user");

app.post("/profile", async (req, res) => {
  const { username, email, lastname, firstname, mobile, vehicleno } = req.body;

  try {
    const newUser = await User.create({
      username,
      email,
      lastname,
      firstname,
      mobile,
      vehicleno
    });

    console.log("User Created:", newUser);
    res.send({ status: "ok", data: "User created" });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error for username
      res
        .status(400)
        .send({ status: "erroruser", message: "Username already exists" });
    } else {
      console.error("Error Creating User:", error);
      res.status(500).send({ status: "error", message: "Error creating user" });
    }
  }
});

app.get("/checkemail/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (user) {
      res.status(200).json({ status: "exists", data: user });
    } else {
      res.status(200).json({ status: "not_found", message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

app.listen(5000, () => {
  console.log("Server is started");
});
