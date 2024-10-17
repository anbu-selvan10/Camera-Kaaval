const mongoose = require("mongoose");

const limitsSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: false,
    },
    reportcount: {
      type: Number,
      required: true,
      default: 0, 
    },
  },
  {
    collection: "Limits",
    timestamps: true, 
  }
);

const Limits=mongoose.model("Limits", limitsSchema);

module.exports=Limits