const mongoose = require("mongoose");

// Define the Report schema
const reportSchema = new mongoose.Schema(
  {
    imageUrl: { type: String },
    location: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    googleMapsUrl: { type: String, required: true },
    description: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: false
    },
    createdAt: { type: Date, default: Date.now },
    isVerified: {
      type: Boolean,
      default: false, // Default set to false
    },
    status: {
      type: String,
      default: "Pending"
    }
  },
  {
    collection: "Reports",
    timestamps: true,
  }
);

const Report=mongoose.model("Report", reportSchema);

module.exports=Report;
