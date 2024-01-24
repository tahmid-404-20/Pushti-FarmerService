const supabase = require("./db.js");
const router = require("express").Router();

async function processSellHistoryData(sellHistoryData) {
  const monthName = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for(let i = 0; i < sellHistoryData.length; i++) {
    sellHistoryData[i].month = monthName[sellHistoryData[i].month_no - 1];
    sellHistoryData[i].amount =
      parseFloat(sellHistoryData[i].total) -
      parseFloat(sellHistoryData[i].totaldeduction) -
      parseFloat(sellHistoryData[i].taxamount) +
      parseFloat(sellHistoryData[i].totalcashback);

    delete sellHistoryData[i].month_no;
    delete sellHistoryData[i].total;
    delete sellHistoryData[i].totaldeduction;
    delete sellHistoryData[i].totalcashback;
    delete sellHistoryData[i].taxamount;
  }

  return sellHistoryData;
}

router.post("/", async (req, res) => {
  let response = await supabase.any(
    `SELECT "name", "nid", "email", "phone", "avatarLink", "permanentAddress",  "dob",  (SELECT "name" AS "unionName" FROM "UnionParishad" where "UnionParishad"."id" = "unionId"), \
        (SELECT "name" AS "agentName" FROM "User" where "id" = (SELECT "agentId" FROM "Farmer" where "Farmer"."id" = $1)) \
        FROM "User" where "id" = $1;`,
    [req.body.id]
  );
  const basicData = response[0];
  let rankandpoint = await supabase.any(
    `SELECT "rank", "points" FROM "Farmer" where "Farmer"."id" = $1;`,
    [req.body.id]
  )[0];

  // populate data table for next rank point point reaching
  let rankTable = await supabase.any(
    `SELECT "className", "max", "min" FROM "Rank"`
  );

  let sellHistoryData = await supabase.any(
    `SELECT EXTRACT('MONTH' FROM "timestamp") AS month_no, SUM("totalTax") as taxAmount, SUM("total") as total, SUM("totalDeduction") as totalDeduction, SUM("cashback") as totalCashback\
        FROM "FarmerBuy" \
        where "farmerId" = $1 and "timestamp" > NOW() - INTERVAL '1 year'\
        GROUP BY EXTRACT('MONTH' FROM "timestamp");`,
    [req.body.id]
  );

  console.log(sellHistoryData);

  let sellHistoryOneYear = await processSellHistoryData(sellHistoryData);
  const responseObj = { basicData, rankandpoint, sellHistoryOneYear };

  res.status(200).json(responseObj);
});

module.exports = router;
