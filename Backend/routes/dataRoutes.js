const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");

const { insertRecord, getRecords, getRecord, getRecordsFromExisitingPatients, getPatients, getRecordToDiagnose, addDiagnosis, getAllUsers, insertPersonnel } = require("../controllers/dataControllers");

// ── Both DOCTOR and NURSE can read records/patients ──
router.get("/get-records", authenticate, authorize("DOCTOR", "NURSE"), getRecords);
router.get("/get-record/:studentId", authenticate, authorize("DOCTOR", "NURSE"), getRecord);
router.get("/get-records-from-existing-patients/:studentId", authenticate, authorize("DOCTOR", "NURSE"), getRecordsFromExisitingPatients);
router.get("/get-patients", authenticate, authorize("DOCTOR", "NURSE"), getPatients);
router.get("/get-all-users", authenticate, authorize("DOCTOR", "NURSE"), getAllUsers);

// ── NURSE can insert new patient records ──
router.post("/insert-record", authenticate, authorize("NURSE"), insertRecord);

// ── DOCTOR-only: diagnosis and personnel management ──
router.get("/get-record-to-diagnose/:recordId", authenticate, authorize("DOCTOR"), getRecordToDiagnose);
router.put("/insert-diagnosis", authenticate, authorize("DOCTOR"), addDiagnosis);
router.post("/insert-personnel", authenticate, authorize("DOCTOR"), insertPersonnel);

module.exports = router;