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
require("./models/LimitDetails.js");

const User = mongoose.model("user");
const Report = mongoose.model("report");
const Fine = mongoose.model("fine");
const Limits = mongoose.model("Limits");

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

app.get('/is-verified', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ isVerified: false });
    }

    res.json({ isVerified: user.isVerified });
  } catch (error) {
    console.error('Error checking verification status:', error);
    res.status(500).json({ error: 'Internal server error' });
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
  const { location, coordinates, googleMapsUrl, description, email } = req.body;
  
  try {
    // Check daily limit
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    
    let limit = await Limits.findOne({
      email,
      createdAt: {
        $gte: todayStart,
        $lt: todayEnd,
      },
    });

    if (limit && limit.reportcount >= 5) {
      return res.status(200).send({ status: "info", message: "You have submitted 5 reports for today. Daily limit reached." });
    }

    // Proceed with report submission
    if (!location || !coordinates || !description) {
      throw new Error("Missing required fields: imageUrl, location, coordinates, or description");
    }

    if (!googleMapsUrl) {
      console.log("googleMapsUrl not provided, generating from coordinates");
      googleMapsUrl = `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
    }

    const reportData = {
      location,
      coordinates,
      description: description.trim(),
      googleMapsUrl,
      email
    };

    const newReport = await Report.create(reportData);
    console.log("Report Created:", newReport);

    // Update or create limit
    if (limit) {
      limit.reportcount += 1;
      await limit.save();
    } else {
      limit = await Limits.create({
        reportcount: 1,
        email,
      });
    }
    console.log("Limit Updated:", limit);

    res.status(200).send({ status: "ok", message: "Report submitted successfully" });
  } catch (error) {
    console.error("Error Submitting Report:", error);
    res.status(400).send({ status: "error", message: "Error submitting report", error: error.message });
  }
});

app.post("/update-report-image", async (req, res) => {
  const { email, imageUrl } = req.body;

  if (!email || !imageUrl) {
    return res.status(400).send({ 
      status: "error", 
      message: "Missing required fields: email or imageUrl" 
    });
  }

  try {
    // Find the most recent report for the given email
    const report = await Report.findOne({ email }).sort({ createdAt: -1 });

    if (!report) {
      return res.status(404).send({ 
        status: "error", 
        message: "No recent report found for this email" 
      });
    }

    // Update the report with the image URL
    report.imageUrl = imageUrl;
    await report.save();

    console.log("Report updated with image URL:", report);

    res.status(200).send({ 
      status: "ok", 
      message: "Report successfully updated with image URL",
      data: { reportId: report._id }
    });
  } catch (error) {
    console.error("Error updating report with image URL:", error);
    res.status(500).send({ 
      status: "error", 
      message: "Error updating report with image URL", 
      error: error.message 
    });
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

app.post("/payFine", async (req, res) => {
  const { id } = req.body; 

  try {
    const fine = await Fine.findById(id);
    if (!fine) {
      return res.status(404).json({ message: "Fine not found" });
    }
    fine.status = "Paid";
    await fine.save();

    return res.status(200).json({ message: "Fine status updated to Paid" });
  } catch (error) {
    console.error("Error updating fine status:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.post("/rewards", async (req, res) => {
  const { email } = req.body;

  try {
    const fines = await Fine.find({ reportedBy: email });

    if (fines.length === 0) {
      return res.status(200).json({ message: "No rewards yet" });
    }

    return res.status(200).json(fines);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "An error occurred while fetching rewards" });
  }
});

app.listen(5000, () => {
  console.log("Server is started on port 5000");
});
