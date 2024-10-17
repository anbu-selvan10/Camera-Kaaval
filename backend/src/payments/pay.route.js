const express=require("express");
const router=express.Router();

const {findFines,payFine}=require("./pay.controller");

router.post("/findFinesByEmail",findFines);
router.post("/payFine",payFine);

module.exports=router

