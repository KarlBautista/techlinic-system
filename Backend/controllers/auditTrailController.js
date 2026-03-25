const supabase = require("../config/supabaseAdmin");

/**
 * Insert an audit trail entry.
 * Called internally from other controllers after successful operations.
 */
async function logActivity({ actor_id, actor_name, actor_role, action, entity_type, entity_id, description, metadata }) {
    try {
        const { error } = await supabase.from("audit_trail").insert({
            actor_id,
            actor_name,
            actor_role,
            action,
            entity_type,
            entity_id: entity_id ? String(entity_id) : null,
            description,
            metadata: metadata || {},
        });
        if (error) console.error("Audit trail insert error:", error.message);
    } catch (err) {
        console.error("Audit trail unexpected error:", err.message);
    }
}

/**
 * GET /api/audit-trail
 * Returns all audit trail entries, visible to both DOCTOR and NURSE.
 * Supports optional query filters: ?entity_type=medicine&actor_role=DOCTOR
 */
const getAuditTrail = async (req, res) => {
    try {
        const { entity_type, actor_role, limit } = req.query;

        let query = supabase
            .from("audit_trail")
            .select("*")
            .order("created_at", { ascending: false });

        if (entity_type) query = query.eq("entity_type", entity_type);
        if (actor_role) query = query.eq("actor_role", actor_role);
        if (limit) query = query.limit(parseInt(limit, 10));

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching audit trail:", error.message);
            return res.status(500).json({ success: false, error: error.message });
        }

        res.status(200).json({ success: true, data });
    } catch (err) {
        console.error("Something went wrong fetching audit trail:", err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { logActivity, getAuditTrail };
