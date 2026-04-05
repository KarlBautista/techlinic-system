const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { validateInsertMedicine, validateUpdateMedicine, validateIdParam } = require("../middleware/validate");

const { insertMedicine, getMedicines, updateMedicine, deleteMedicine } = require("../controllers/medicineController");

// ── Both roles can view medicines ──
router.get("/get-medicines", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getMedicines);

// ── Both roles can add/update/delete medicines (not ADMIN) ──
router.post("/insert-medicine", authenticate, authorize("DOCTOR", "NURSE"), validateInsertMedicine, insertMedicine);
router.put("/update-medicine", authenticate, authorize("DOCTOR", "NURSE"), validateUpdateMedicine, updateMedicine);
router.delete("/delete-medicine/:medicineId", authenticate, authorize("DOCTOR", "NURSE"), validateIdParam('medicineId'), deleteMedicine);

module.exports = router;