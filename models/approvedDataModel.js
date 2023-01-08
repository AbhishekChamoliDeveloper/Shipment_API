const mongoose = require("mongoose");

const approvedDataSchema = new mongoose.Schema({
  excelData: [
    {
      type: Object,
    },
  ],
});

module.exports = mongoose.model("ApprovedData", approvedDataSchema);
