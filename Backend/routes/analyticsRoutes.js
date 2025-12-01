const express = require("express");
const router = express.Router();

const { getWeeklyPatients, getMonthyPatients, getQuarterlyPatient, getYearlyPatientCount, getWeeklyPatientsPerDepartment, getMonthlyPatientsPerDepartment,
getQuarterlyPatientsPerDepartment, getYearlyPatientsPerDepartment, getWeeklyTopDiagnoses, getMonthlyTopDiagnoses, getQuarterlyTopDiagnoses, getYearlyTopDiagnoses
 } = require("../controllers/analyticsController");

router.get("/get-weekly-patients", getWeeklyPatients);
router.get("/get-monthly-patients", getMonthyPatients);
router.get("/get-quarterly-patients", getQuarterlyPatient);
router.get("/get-yearly-patients", getYearlyPatientCount);
router.get("/get-weekly-patients-per-department", getWeeklyPatientsPerDepartment);
router.get("/get-monthly-patients-per-department", getMonthlyPatientsPerDepartment);
router.get("/get-quarterly-patients-per-department", getQuarterlyPatientsPerDepartment);
router.get("/get-yearly-patients-per-department", getYearlyPatientsPerDepartment);
router.get("/get-weekly-top-diagnoses", getWeeklyTopDiagnoses);
router.get("/get-monthly-top-diagnoses", getMonthlyTopDiagnoses);
router.get("/get-quarterly-top-diagnoses", getQuarterlyTopDiagnoses);
router.get("/get-yearly-top-diagnoses", getYearlyTopDiagnoses);
module.exports = router;