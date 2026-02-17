const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");

const { getAllDiseases, getAllNumberOfDiseases, addDisease } = require("../controllers/diseasesController");

// ── Both roles can view diseases ──
router.get("/get-all-diseases", authenticate, authorize("DOCTOR", "NURSE"), getAllDiseases);
router.get("/get-all-number-of-diseases", authenticate, authorize("DOCTOR", "NURSE"), getAllNumberOfDiseases);

// ── Only DOCTOR can add new diseases ──
router.post("/add-disease", authenticate, authorize("DOCTOR"), addDisease);


module.exports = router;