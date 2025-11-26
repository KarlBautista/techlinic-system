const express = require("express");
const router = express.Router();

const { getWeeklyPatients, getMonthyPatients, getQuarterlyPatient, getYearlyPatientCount } = require("../controllers/analyticsController");

router.get("/get-weekly-patients", getWeeklyPatients);
router.get("/get-monthly-patients", getMonthyPatients);
router.get("/get-quarterly-patients", getQuarterlyPatient);
router.get("/get-yearly-patients", getYearlyPatientCount)
module.exports = router;