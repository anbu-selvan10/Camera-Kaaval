const mongoose = require("mongoose");

// Define the schema with field validation
const userDetailsSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true, // Trims extra whitespace
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true, // Trims extra whitespace
        match: [/.+\@.+\..+/, 'Please fill a valid email address'], // Validates email format
    },
    password: {
        type: String
    },
    lastname: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Please fill a valid 10-digit mobile number'], // Validates phone number format
    }
}, {
    collection: "camerakaaval",
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Register the model with mongoose
mongoose.model("camerakaaval", userDetailsSchema);
