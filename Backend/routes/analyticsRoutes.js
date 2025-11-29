const express = require("express");
const router = express.Router();

const { getWeeklyPatients, getMonthyPatients, getQuarterlyPatient, getYearlyPatientCount, getWeeklyPatientsPerDepartment } = require("../controllers/analyticsController");

router.get("/get-weekly-patients", getWeeklyPatients);
router.get("/get-monthly-patients", getMonthyPatients);
router.get("/get-quarterly-patients", getQuarterlyPatient);
router.get("/get-yearly-patients", getYearlyPatientCount);
router.get("/get-weekly-patients-per-department", getWeeklyPatientsPerDepartment);
module.exports = router;