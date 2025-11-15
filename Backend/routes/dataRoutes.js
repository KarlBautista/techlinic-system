const express = require("express");
const router = express.Router();

const { insertRecord, getRecords, getRecord } = require("../controllers/dataControllers");

router.post("/insert-record", insertRecord);
router.get("/get-records", getRecords);
router.get("/get-record/:patientId", getRecord)

module.exports = router;