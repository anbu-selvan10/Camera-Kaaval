const User=require("../models/UserDetails");

const updateProfile = async(req,res) =>{
  const { username, email, lastname, firstname, mobile, vehicleno, downloadUri } = req.body;

  try {
    const newUser = await User.create({
      username,
      email,
      lastname,
      firstname,
      mobile,
      vehicleno,
      downloadUri
    });

    console.log("User Created:", newUser);
    res.send({ status: "ok", data: "User created" });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error for username
      res
        .status(400)
        .send({ status: "erroruser", message: "Username already exists" });
    } else {
      console.error("Error Creating User:", error);
      res.status(500).send({ status: "error", message: "Error creating user" });
    }
  }
}

const checkEmail=async(req,res)=>{
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (user) {
      res.status(200).json({ status: "exists", data: user });
    } else {
      res.status(200).json({ status: "not_found", message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }


}


module.exports={
    updateProfile,
    checkEmail
}