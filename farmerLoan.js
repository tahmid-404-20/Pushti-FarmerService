const supabase = require("./db.js");
const router = require("express").Router();
const axios = require("axios");

const loanMsUrl = process.env.loanMsUrl;

router.get("/", async (req, res) => {
  const historyUrl = loanMsUrl + "loan_history/farmer";

  const req_data = { farmer_id: req.user.id, page: 0 };

  try {
    const response = await axios.post(historyUrl, req_data);
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const historyUrl = loanMsUrl + "loan_history/farmer";

  const req_data = { farmer_id: req.user.id, page: req.body.page };

  try {
    const response = await axios.post(historyUrl, req_data);
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/request", async (req, res) => {
  const requestUrl = loanMsUrl + "loan_request/farmer";

  // const { farmer_id, agent_id, min, max, description } = req.body;

  //   get agent_id
  let data = await supabase.any(
    `SELECT "agentId" FROM "Farmer" where id = $1`,
    [req.user.id]
  );
  const agent_id = data[0].agentId;

  const req_data = {
    farmer_id: req.user.id,
    agent_id: agent_id,
    min: req.body.min,
    max: req.body.max,
    description: req.body.description,
  };

  try {
    const response = await axios.post(requestUrl, req_data);
    res.status(200).json(response.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
