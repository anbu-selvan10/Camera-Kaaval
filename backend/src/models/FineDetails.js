const mongoose = require("mongoose");

// Define the Fine schema
const fineSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: false
    },
    description: { 
      type: String, 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    reportedBy: {
      type: String,
      required: true
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    status: {
      type: String,
      default: "Unpaid"
    }
  },
  {
    collection: "Fines", // Set the collection name
    timestamps: true,    // Adds createdAt and updatedAt fields
  }
);

const Fine=mongoose.model("Fine", fineSchema);

module.exports=Fine
