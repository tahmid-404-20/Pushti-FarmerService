const supabase = require("./db.js");
const router = require("express").Router();
const axios = require("axios");

router.get("/", async (req, res) => {
  let response = await supabase.any(
    `SELECT "name", "nid", "email", "phone", "avatarLink", "permanentAddress",  "dob",  (SELECT "name" AS "unionName" FROM "UnionParishad" where "UnionParishad"."id" = "unionId"), \
        (SELECT "name" AS "agentName" FROM "User" where "id" = (SELECT "agentId" FROM "Farmer" where "Farmer"."id" = $1)) \
        FROM "User" where "id" = $1;`,
    [req.user.id]
  );
  const basicData = response[0];
  let rankandpoint = await supabase.any(`SELECT "rank", "points" FROM "Farmer" where "Farmer"."id" = $1;`, [req.user.id])[0];

//   need to get the sell history of last 1 year, the sell history contains a column "timestamp" which is the time of sell

    let rankTable = await supabase.any(`SELECT "className", "max", "min" FROM "Rank"`);

    let sellHistoryData = await supabase.any(
        `SELECT "total", "totalDeduction", "totalTax", "timestamp" FROM "FarmerBuy" where "farmerId" = $1 and "timestamp" > NOW() - INTERVAL '1 year';`,
        [req.user.id]
    );

    const responseObj = { basicData, rankandpoint, sellHistoryData };

    res.status(200).json(responseObj);

});

module.exports = router;
