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

  sellHistoryData.month = monthName[sellHistoryData.month_no - 1];

  // compute total payable amount
  sellHistoryData.amount =
    parseFloat(sellHistoryData.total) -
    parseFloat(sellHistoryData.totaldeduction) -
    parseFloat(sellHistoryData.taxamount) +
    parseFloat(sellHistoryData.totalcashback);

  delete sellHistoryData.month_no;
  delete sellHistoryData.total;
  delete sellHistoryData.totaldeduction;
  delete sellHistoryData.totalcashback;
  delete sellHistoryData.taxamount;

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

  let sellHistoryOneYear = await processSellHistoryData(sellHistoryData[0]);
  const responseObj = { basicData, rankandpoint, sellHistoryOneYear };

  res.status(200).json(responseObj);
});

module.exports = router;
