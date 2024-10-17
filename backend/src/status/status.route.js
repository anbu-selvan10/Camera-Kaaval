const express=require("express");
const router=express.Router();

const { getReports }=require("./status.controller");

router.post("/getReports",getReports);

module.exports=router

