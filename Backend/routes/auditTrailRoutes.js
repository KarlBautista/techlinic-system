const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { getAuditTrail } = require("../controllers/auditTrailController");

// Both DOCTOR and NURSE can view the full audit trail
router.get("/audit-trail", authenticate, authorize("DOCTOR", "NURSE"), getAuditTrail);

module.exports = router;
