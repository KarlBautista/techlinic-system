const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");

const { getWeeklyPatients, getMonthyPatients, getQuarterlyPatient, getYearlyPatientCount, getWeeklyPatientsPerDepartment, getMonthlyPatientsPerDepartment,
getQuarterlyPatientsPerDepartment, getYearlyPatientsPerDepartment, getWeeklyTopDiagnoses, getMonthlyTopDiagnoses, getQuarterlyTopDiagnoses, getYearlyTopDiagnoses,
getMostUsedMedicines
 } = require("../controllers/analyticsController");

// ── All analytics endpoints require authentication, both roles can view ──
router.get("/get-weekly-patients", authenticate, authorize("DOCTOR", "NURSE"), getWeeklyPatients);
router.get("/get-monthly-patients", authenticate, authorize("DOCTOR", "NURSE"), getMonthyPatients);
router.get("/get-quarterly-patients", authenticate, authorize("DOCTOR", "NURSE"), getQuarterlyPatient);
router.get("/get-yearly-patients", authenticate, authorize("DOCTOR", "NURSE"), getYearlyPatientCount);
router.get("/get-weekly-patients-per-department", authenticate, authorize("DOCTOR", "NURSE"), getWeeklyPatientsPerDepartment);
router.get("/get-monthly-patients-per-department", authenticate, authorize("DOCTOR", "NURSE"), getMonthlyPatientsPerDepartment);
router.get("/get-quarterly-patients-per-department", authenticate, authorize("DOCTOR", "NURSE"), getQuarterlyPatientsPerDepartment);
router.get("/get-yearly-patients-per-department", authenticate, authorize("DOCTOR", "NURSE"), getYearlyPatientsPerDepartment);
router.get("/get-weekly-top-diagnoses", authenticate, authorize("DOCTOR", "NURSE"), getWeeklyTopDiagnoses);
router.get("/get-monthly-top-diagnoses", authenticate, authorize("DOCTOR", "NURSE"), getMonthlyTopDiagnoses);
router.get("/get-quarterly-top-diagnoses", authenticate, authorize("DOCTOR", "NURSE"), getQuarterlyTopDiagnoses);
router.get("/get-yearly-top-diagnoses", authenticate, authorize("DOCTOR", "NURSE"), getYearlyTopDiagnoses);
router.get("/get-most-used-medicines", authenticate, authorize("DOCTOR", "NURSE"), getMostUsedMedicines);
module.exports = router;