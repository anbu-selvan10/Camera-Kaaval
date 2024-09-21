const mongoose = require("mongoose");

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
    },
    vehicleno: {
        type: String,
        required: true,
        match: [/^TN \d{2} [A-Z]{2} \d{4}$/, 'Please enter a valid vehicle number'], // Validates vehicle number format
    },
    isVerified: {
        type: Boolean,
        default: false, // Default set to false
    }
}, {
    collection: "Users",
    timestamps: true
});


mongoose.model("user", userDetailsSchema);