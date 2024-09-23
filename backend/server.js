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
require("./models/ReportDetails.js");
require("./models/FineDetails.js");

const User = mongoose.model("user");
const Report = mongoose.model("report");
const Fine = mongoose.model("fine");

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

app.post("/submit-report", async (req, res) => {
  const { imageUrl, location, coordinates, googleMapsUrl, description, email } = req.body;

  try {
    if (!imageUrl || !location || !coordinates || !description) {
      throw new Error("Missing required fields: imageUrl, location, coordinates, or description");
    }

    if (!googleMapsUrl) {
      console.log("googleMapsUrl not provided, generating from coordinates");
      googleMapsUrl = `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
    }

    const reportData = {
      imageUrl,
      location,
      coordinates,
      description: description.trim(),
      googleMapsUrl,
      email
    };

    const newReport = await Report.create(reportData);

    console.log("Report Created:", newReport);
    res.status(200).send({ status: "ok", data: "Report submitted successfully" });
  } catch (error) {
    console.error("Error Creating Report:", error);
    res.status(400).send({ status: "error", message: "Error submitting report", error: error.message });
  }
});

app.post('/getReports', async (req, res) => {
  const { email } = req.body;

  try {
    // Use `find` to get all reports related to the email
    const reports = await Report.find({ email });
    res.status(200).json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post("/findFinesByEmail", async (req, res) => {
  const { email } = req.body; // Extract email from request body

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const fines = await Fine.find({ email });

    if (fines.length === 0) {
      return res.status(200).json({ message: "No fines found for this email" });
    }

    res.status(200).json(fines);
  } catch (error) {
    console.error("Error querying fines:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.listen(5000, () => {
  console.log("Server is started on port 5000");
});
