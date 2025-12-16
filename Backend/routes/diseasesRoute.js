const express = require("express");
const router = express.Router();


const { getAllDiseases, getAllNumberOfDiseases } = require("../controllers/diseasesController");

router.get("/get-all-diseases", getAllDiseases);
router.get("/get-all-number-of-diseases", getAllNumberOfDiseases)


module.exports = router;