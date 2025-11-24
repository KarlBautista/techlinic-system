const express = require("express");
const router = express.Router();

const { getWeeklyPatients, getMonthyPatients } = require("../controllers/analyticsController");

router.get("/get-weekly-patients", getWeeklyPatients);
router.get("/get-monthly-patients", getMonthyPatients)
module.exports = router;