const express = require("express");
const router = express.Router();

const { insertMedicine, getMedicines, updateMedicine, deleteMedicine } = require("../controllers/medicineController");

router.post("/insert-medicine", insertMedicine);
router.get("/get-medicines", getMedicines);
router.put("/update-medicine", updateMedicine);
router.delete("/delete-medicine/:medicineId", deleteMedicine);

module.exports = router;