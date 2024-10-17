const Fine=require("../models/FineDetails");

const findFines=async(req,res)=>{
    const { email } = req.body; // Extract email from request body

    try {
        if (!email) {
        return res.status(400).json({ message: "Email is required" });
        }

        const fines = await Fine.find({ email });

        if (fines.length === 0) {
        return res.status(200).json({ message: "No fines found for this email" });
        }

        res.status(200).json(fines);
    } catch (error) {
        console.error("Error querying fines:", error);
        res.status(500).json({ message: "Server error" });
    }

}

const payFine=async(req,res)=>{
    const { id } = req.body; 

    try {
      const fine = await Fine.findById(id);
      if (!fine) {
        return res.status(404).json({ message: "Fine not found" });
      }
      fine.status = "Paid";
      await fine.save();
  
      return res.status(200).json({ message: "Fine status updated to Paid" });
    } catch (error) {
      console.error("Error updating fine status:", error);
      return res.status(500).json({ message: "Server error" });
    }
}

module.exports={
    findFines,
    payFine,
}
