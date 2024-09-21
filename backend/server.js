const express=require("express");
const app=express();
const mongoose=require("mongoose");

app.use(express.json());

const monogUrl="mongodb+srv://vivekanandmu22:vivek%40220105@cluster0.mudbexc.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(monogUrl).then(()=>
    {
        console.log("Database connected");
    })
    .catch((e)=>{
        console.log(e);
    });

require('./Userdetails');

const User=mongoose.model("camerakaaval")

app.get("/",(req,res)=>{
    res.send({status:"Started"});
})

app.post("/profile", async (req, res) => {
    const { email, firstname, lastname, password, username, mobile } = req.body;
    
    console.log("Request Body:", req.body); // Log the received data
  
    try {
      const newUser = await User.create({
        username,
        email,
        lastname,
        firstname,
        mobile,
        password,
      });
  
      console.log("User Created:", newUser); 
  
      res.send({ status: "ok", data: "User created" });
    } catch (error) {
      console.error("Error Creating User:", error); 
      res.send({ status: "error", data: "Error creating user" });
    }
  });
  

app.listen(5000,()=>{
    console.log("Server is started");
})