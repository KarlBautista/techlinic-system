const express = require("express");
const router = express.Router();

const { insertMedicine, getMedicines, updateMedicine } = require("../controllers/medicineController");

router.post("/insert-medicine", insertMedicine);
router.get("/get-medicines", getMedicines);
router.put("/update-medicine", updateMedicine)

module.exports = router;