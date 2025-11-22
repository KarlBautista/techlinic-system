const express = require("express");
const router = express.Router();

const { insertMedicine, getMedicines } = require("../controllers/medicineController");

router.post("/insert-medicine", insertMedicine);
router.get("/get-medicines", getMedicines)

module.exports = router;