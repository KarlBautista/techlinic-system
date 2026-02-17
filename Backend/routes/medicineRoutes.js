const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");

const { insertMedicine, getMedicines, updateMedicine, deleteMedicine } = require("../controllers/medicineController");

// ── Both roles can view medicines ──
router.get("/get-medicines", authenticate, authorize("DOCTOR", "NURSE"), getMedicines);

// ── Both roles can add/update/delete medicines ──
router.post("/insert-medicine", authenticate, authorize("DOCTOR", "NURSE"), insertMedicine);
router.put("/update-medicine", authenticate, authorize("DOCTOR", "NURSE"), updateMedicine);
router.delete("/delete-medicine/:medicineId", authenticate, authorize("DOCTOR", "NURSE"), deleteMedicine);


module.exports = router;