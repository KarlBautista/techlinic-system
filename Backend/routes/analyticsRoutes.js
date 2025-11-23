const express = require("express");
const router = express.Router();

const { getWeeklyPatients } = require("../controllers/analyticsController");

router.get("/get-weekly-patients", getWeeklyPatients);

module.exports = router;