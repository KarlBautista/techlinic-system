const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { validateInsertRecord, validateAddDiagnosis, validateInsertPersonnel, validateStudentIdParam, validateIdParam } = require("../middleware/validate");

const { insertRecord, getRecords, getRecord, getRecordsFromExisitingPatients, getPatients, getRecordToDiagnose, addDiagnosis, getAllUsers, insertPersonnel, deactivateUser, reactivateUser } = require("../controllers/dataControllers");

// ── Both DOCTOR and NURSE can read records/patients ──
router.get("/get-records", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getRecords);
router.get("/get-record/:studentId", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), validateStudentIdParam, getRecord);
router.get("/get-records-from-existing-patients/:studentId", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), validateStudentIdParam, getRecordsFromExisitingPatients);
router.get("/get-patients", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getPatients);
router.get("/get-all-users", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getAllUsers);

// ── NURSE can insert new patient records ──
router.post("/insert-record", authenticate, authorize("NURSE"), validateInsertRecord, insertRecord);

// ── DOCTOR-only: diagnosis ──
router.get("/get-record-to-diagnose/:recordId", authenticate, authorize("DOCTOR"), validateIdParam('recordId'), getRecordToDiagnose);
router.put("/insert-diagnosis", authenticate, authorize("DOCTOR"), validateAddDiagnosis, addDiagnosis);

// ── ADMIN-only: manage personnel ──
router.post("/insert-personnel", authenticate, authorize("ADMIN"), validateInsertPersonnel, insertPersonnel);

// ── ADMIN-only: soft delete (deactivate/reactivate) ──
router.patch("/deactivate-user/:userId", authenticate, authorize("ADMIN"), deactivateUser);
router.patch("/reactivate-user/:userId", authenticate, authorize("ADMIN"), reactivateUser);

module.exports = router;