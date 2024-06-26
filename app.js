const express = require("express");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");
const app = express();
const PORT = process.env.port;

app.use(express.json());
app.use(cors({ origin: "*" }));

const loanRouter = require("./farmerLoan");
const dashboardRouter = require("./farmerDashboard");
const leaderboardRouter = require("./farmerLeaderboard");
const supportRouter = require("./farmerSupport");

app.use("/loan", loanRouter);
app.use("/dashboard", dashboardRouter);
app.use("/buy", require("./farmerTransactions"));
app.use("/leaderboard", leaderboardRouter);
app.use("/support", supportRouter);


app.listen(PORT, async () => {
  // console.log(`Pushti-AuthenticationMS is running on port ${PORT}`);
  console.log(`Farmer Service listening on port ${PORT}`);
  try {
    let serviceRegisterUrl = String(process.env.serviceRegistryUrl) + "/register";

    await axios.post(serviceRegisterUrl, {
      name: process.env.selfName,
      url: process.env.selfUrl,
    });
    console.log("Service registered successfully");
  } catch (error) {
    console.error("Failed to register service:", error);
    // turn off server if service registration fails
    process.exit(1);
  }
});

// Function to de-register the service
const deregisterService = async () => {
  try {
    let serviceRegisterUrl =
      String(process.env.serviceRegistryUrl) + "/deregister";
    await axios.post(serviceRegisterUrl, { name: process.env.selfName });
    console.log("Service de-registered successfully");
  } catch (error) {
    console.error("Failed to de-register service:", error);
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
    await deregisterService();
    process.exit(0);
};

// Listen for termination and interrupt signals
process.on('SIGTERM', gracefulShutdown); // For termination signal
process.on('SIGINT', gracefulShutdown); // For interrupt signal
process.on('uncaughtException', gracefulShutdown); // For uncaught exceptions

