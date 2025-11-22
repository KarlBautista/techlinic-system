const express = require("express");
const router = express.Router();

const { insertRecord, getRecords, getRecord, getRecordsFromExisitingPatients } = require("../controllers/dataControllers");

router.post("/insert-record", insertRecord);
router.get("/get-records", getRecords);
router.get("/get-record/:studentId", getRecord);
router.get("/get-records-from-existing-patients/:studentId", getRecordsFromExisitingPatients)

module.exports = router;