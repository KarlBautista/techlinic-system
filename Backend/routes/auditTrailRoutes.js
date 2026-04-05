const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { validateAuditTrailQuery } = require("../middleware/validate");
const { getAuditTrail } = require("../controllers/auditTrailController");

// All roles can view the full audit trail
router.get("/audit-trail", authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), validateAuditTrailQuery, getAuditTrail);

module.exports = router;
