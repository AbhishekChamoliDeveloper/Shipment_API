const express = require("express");
const mongoose = require("mongoose");
const xlsx = require("xlsx");
const bodyparser = require("body-parser");
const multer = require("multer");
const memoryStorage = multer.memoryStorage();
const ApprovedData = require("./models/approvedDataModel");

const app = express();
const upload = multer({ storage: memoryStorage });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = "database url";

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

app.post("/excel-to-json", upload.single("file"), async (req, res) => {
  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetNames = workbook.SheetNames;
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetNames[0]]);

    res.status(200).json(data);
  } catch (err) {
    res.status(400).json(err);
  }
});

app.post("/approve", async (req, res) => {
  const result = await ApprovedData.create({ excelData: req.body.data });

  res.status(200).json(result);
});

app.get("/product-by-destination/:dest", async (req, res) => {
  try {
    const dest = req.params.dest;
    const data = await ApprovedData.aggregate([
      {
        $match: {
          "excelData.Destination": { $regex: new RegExp(`^${dest}$`, "i") },
        },
      },
      {
        $project: {
          _id: 0,
          excelData: {
            $filter: {
              input: "$excelData",
              as: "item",
              cond: {
                $eq: [{ $toLower: "$$item.Destination" }, { $toLower: dest }],
              },
            },
          },
        },
      },
    ]);
    res.status(200).json(data[0].excelData);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = app;
