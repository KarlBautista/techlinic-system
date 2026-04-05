const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { validateCustomDateRange } = require("../middleware/validate");

const { getWeeklyPatients, getMonthyPatients, getQuarterlyPatient, getYearlyPatientCount, getWeeklyPatientsPerDepartment, getMonthlyPatientsPerDepartment,
getQuarterlyPatientsPerDepartment, getYearlyPatientsPerDepartment, getWeeklyTopDiagnoses, getMonthlyTopDiagnoses, getQuarterlyTopDiagnoses, getYearlyTopDiagnoses,
getMostUsedMedicines, getCustomPatients, getCustomPatientsPerDepartment, getCustomTopDiagnoses
 } = require("../controllers/analyticsController");

// ── All analytics endpoints require authentication, all roles can view ──
router.get("/get-weekly-patients", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getWeeklyPatients);
router.get("/get-monthly-patients", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getMonthyPatients);
router.get("/get-quarterly-patients", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getQuarterlyPatient);
router.get("/get-yearly-patients", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getYearlyPatientCount);
router.get("/get-weekly-patients-per-department", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getWeeklyPatientsPerDepartment);
router.get("/get-monthly-patients-per-department", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getMonthlyPatientsPerDepartment);
router.get("/get-quarterly-patients-per-department", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getQuarterlyPatientsPerDepartment);
router.get("/get-yearly-patients-per-department", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getYearlyPatientsPerDepartment);
router.get("/get-weekly-top-diagnoses", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getWeeklyTopDiagnoses);
router.get("/get-monthly-top-diagnoses", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getMonthlyTopDiagnoses);
router.get("/get-quarterly-top-diagnoses", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getQuarterlyTopDiagnoses);
router.get("/get-yearly-top-diagnoses", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getYearlyTopDiagnoses);
router.get("/get-most-used-medicines", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getMostUsedMedicines);
router.get("/get-custom-patients", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), validateCustomDateRange, getCustomPatients);
router.get("/get-custom-patients-per-department", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), validateCustomDateRange, getCustomPatientsPerDepartment);
router.get("/get-custom-top-diagnoses", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), validateCustomDateRange, getCustomTopDiagnoses);
module.exports = router;