const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { validateInsertRecord, validateAddDiagnosis, validateInsertPersonnel, validateStudentIdParam, validateIdParam } = require("../middleware/validate");

const { insertRecord, getRecords, getRecord, getRecordsFromExisitingPatients, getPatients, getRecordToDiagnose, addDiagnosis, getAllUsers, insertPersonnel } = require("../controllers/dataControllers");

// ── Both DOCTOR and NURSE can read records/patients ──
router.get("/get-records", authenticate, authorize("DOCTOR", "NURSE"), getRecords);
router.get("/get-record/:studentId", authenticate, authorize("DOCTOR", "NURSE"), validateStudentIdParam, getRecord);
router.get("/get-records-from-existing-patients/:studentId", authenticate, authorize("DOCTOR", "NURSE"), validateStudentIdParam, getRecordsFromExisitingPatients);
router.get("/get-patients", authenticate, authorize("DOCTOR", "NURSE"), getPatients);
router.get("/get-all-users", authenticate, authorize("DOCTOR", "NURSE"), getAllUsers);

// ── NURSE can insert new patient records ──
router.post("/insert-record", authenticate, authorize("NURSE"), validateInsertRecord, insertRecord);

// ── DOCTOR-only: diagnosis and personnel management ──
router.get("/get-record-to-diagnose/:recordId", authenticate, authorize("DOCTOR"), validateIdParam('recordId'), getRecordToDiagnose);
router.put("/insert-diagnosis", authenticate, authorize("DOCTOR"), validateAddDiagnosis, addDiagnosis);
router.post("/insert-personnel", authenticate, authorize("DOCTOR"), validateInsertPersonnel, insertPersonnel);

module.exports = router;