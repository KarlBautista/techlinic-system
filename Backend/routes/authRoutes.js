const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

/**
 * GET /api/auth/me
 * 
 * Returns the authenticated user's profile including their role.
 * The frontend calls this after login to verify the session is valid
 * and to get the server-authoritative role (not just what's in the browser).
 */
router.get("/auth/me", authenticate, (req, res) => {
    return res.status(200).json({
        success: true,
        data: {
            id: req.userProfile.id,
            email: req.userProfile.email,
            first_name: req.userProfile.first_name,
            last_name: req.userProfile.last_name,
            role: req.userProfile.role,
            sex: req.userProfile.sex,
            address: req.userProfile.address,
            date_of_birth: req.userProfile.date_of_birth,
            signature_url: req.userProfile.signature_url,
        }
    });
});

/**
 * GET /api/auth/role
 * 
 * Lightweight endpoint that returns only the user's role.
 * Useful for quick permission checks from the frontend.
 */
router.get("/auth/role", authenticate, (req, res) => {
    return res.status(200).json({
        success: true,
        data: {
            role: req.userProfile.role
        }
    });
});

module.exports = router;
