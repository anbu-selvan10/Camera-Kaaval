const express=require("express");
const cors = require("cors");
const mongoose = require("./src/db/mongo_db");

const app = express();
const port=5000;

const profileRoutes=require("./src/profile/profile.route");
const reportRoutes=require("./src/reports/reports.route");
const statusRoutes=require("./src/status/status.route");
const payRoutes=require("./src/payments/pay.route");
const rewardRoutes=require("./src/rewards/rewards.route");

app.use(express.json());
app.use(cors());

app.use("/api/profiles",profileRoutes);
app.use("/api/reports",reportRoutes);
app.use("/api/status",statusRoutes);
app.use("/api/payments",payRoutes);
app.use("/api/reward",rewardRoutes);

app.listen(port, () => {
    console.log("Server is started on port 5000");
});
  


