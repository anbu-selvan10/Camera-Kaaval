const express=require("express");
const router=express.Router();

const {rewardDetails}=require("./rewards.controller");

router.post("/rewards",rewardDetails);

module.exports=router