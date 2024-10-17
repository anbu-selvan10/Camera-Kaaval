const Fine=require("../models/FineDetails");

const rewardDetails=async(req,res)=>{
    const { email } = req.body;

    try {
        const fines = await Fine.find({ reportedBy: email });

        if (fines.length === 0) {
        return res.status(200).json({ message: "No rewards yet" });
        }

        return res.status(200).json(fines);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "An error occurred while fetching rewards" });
    }
}

module.exports={
    rewardDetails
}

