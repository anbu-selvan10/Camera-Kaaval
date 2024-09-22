const mongoose = require('mongoose');

// Define the Report schema
const reportSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    googleMapsUrl: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
    {
        collection: "Reports",
        timestamps: true
});
  
  mongoose.model("report", reportSchema);


