const Report=require("../models/ReportDetails");
const User=require("../models/UserDetails");
const Limits=require("../models/LimitDetails");

const submitReport=async(req,res)=>{
    const { location, coordinates, googleMapsUrl, description, email } = req.body;
  
    try {
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

}

const isVerified=async(req,res)=>{
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
}

const updateImage=async(req,res)=>{
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
}

module.exports={
    submitReport,
    isVerified,
    updateImage
}
