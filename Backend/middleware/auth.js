const supabase = require("../config/supabaseClient");
const supabaseAdmin = require("../config/supabaseAdmin");

/**
 * Authentication Middleware
 * 
 * Verifies the Supabase JWT token from the Authorization header.
 * Attaches `req.user` (auth user) and `req.userProfile` (DB profile with role).
 * 
 * Usage: router.get("/protected", authenticate, handler)
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                error: "Missing or invalid Authorization header. Expected: Bearer <token>"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: "No token provided"
            });
        }

        // Verify the JWT with Supabase Auth
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data?.user) {
            console.error("Auth middleware - token verification failed:", error?.message);
            return res.status(401).json({
                success: false,
                error: "Invalid or expired token"
            });
        }

        const authUser = data.user;

        // Fetch the user profile (with role) from the public.users table
        const { data: userProfile, error: profileError } = await supabaseAdmin
            .from("users")
            .select("id, first_name, last_name, email, role, sex, address, date_of_birth, signature_url")
            .eq("id", authUser.id)
            .single();

        if (profileError || !userProfile) {
            console.error("Auth middleware - profile fetch failed:", profileError?.message);
            return res.status(403).json({
                success: false,
                error: "User profile not found. Contact an administrator."
            });
        }

        if (!userProfile.role) {
            return res.status(403).json({
                success: false,
                error: "User has no role assigned. Contact an administrator."
            });
        }

        // Attach user data to the request object
        req.user = authUser;           // Supabase auth user (id, email, etc.)
        req.userProfile = userProfile; // DB profile (id, role, first_name, etc.)
        req.userRole = userProfile.role; // Convenience: "DOCTOR" or "NURSE"

        next();
    } catch (err) {
        console.error("Auth middleware - unexpected error:", err.message);
        return res.status(500).json({
            success: false,
            error: "Authentication failed due to server error"
        });
    }
};

/**
 * Role Authorization Middleware Factory
 * 
 * Creates middleware that checks if the authenticated user has one of the allowed roles.
 * MUST be used AFTER the `authenticate` middleware.
 * 
 * Usage: 
 *   router.post("/admin-only", authenticate, authorize("DOCTOR"), handler)
 *   router.get("/any-role", authenticate, authorize("DOCTOR", "NURSE"), handler)
 * 
 * @param  {...string} allowedRoles - Roles that are permitted (e.g., "DOCTOR", "NURSE")
 * @returns {Function} Express middleware
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole) {
            return res.status(403).json({
                success: false,
                error: "No role found. Authentication may have been skipped."
            });
        }

        if (!allowedRoles.includes(req.userRole)) {
            console.warn(
                `RBAC denied: User ${req.userProfile?.email} (role: ${req.userRole}) ` +
                `attempted to access ${req.method} ${req.originalUrl}. ` +
                `Required roles: [${allowedRoles.join(", ")}]`
            );
            return res.status(403).json({
                success: false,
                error: `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${req.userRole}`
            });
        }

        next();
    };
};

module.exports = { authenticate, authorize };
