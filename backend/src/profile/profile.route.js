const express=require("express");
const router=express.Router();

const { updateProfile,checkEmail } = require("./profile.controller");

router.post("/profile",updateProfile)

router.get("/checkemail/:email",checkEmail)

module.exports=router