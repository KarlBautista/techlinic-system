const express = require("express");
const router = express.Router();


const { getAllDiseases, getAllNumberOfDiseases, addDisease } = require("../controllers/diseasesController");

router.get("/get-all-diseases", getAllDiseases);
router.get("/get-all-number-of-diseases", getAllNumberOfDiseases)
router.post("/add-disease", addDisease);


module.exports = router;