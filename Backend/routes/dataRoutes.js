const express = require("express");
const router = express.Router();

const { insertRecord, getRecords } = require("../controllers/dataControllers");

router.post("/insert-record", insertRecord);
router.get("/get-records", getRecords);

module.exports = router;