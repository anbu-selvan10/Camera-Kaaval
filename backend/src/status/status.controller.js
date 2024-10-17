const Report=require("../models/ReportDetails");


const getReports = async(req,res)=>{
    const { email } = req.body;
    try {
        const reports = await Report.find({ email });
        res.status(200).json({ reports });
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

module.exports={
    getReports
}