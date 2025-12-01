const express = require("express");
const router = express.Router();

const { insertRecord, getRecords, getRecord, getRecordsFromExisitingPatients, getPatients, getRecordToDiagnose, addDiagnosis } = require("../controllers/dataControllers");

router.post("/insert-record", insertRecord);
router.get("/get-records", getRecords);
router.get("/get-record/:studentId", getRecord);
router.get("/get-records-from-existing-patients/:studentId", getRecordsFromExisitingPatients);
router.get("/get-patients", getPatients);
router.get("/get-record-to-diagnose/:recordId", getRecordToDiagnose);
router.put("/insert-diagnosis", addDiagnosis);
module.exports = router;