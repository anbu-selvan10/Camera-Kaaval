const express=require("express");
const router=express.Router();

const {submitReport,isVerified,updateImage}=require("./reports.controller");

router.post("/submit-report",submitReport);
router.get("/is-verified",isVerified);
router.post("/update-report-image",updateImage);

module.exports=router

