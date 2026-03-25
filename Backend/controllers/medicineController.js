const supabase = require("../config/supabaseAdmin");
const { logActivity } = require("./auditTrailController");

const insertMedicine = async (req, res) => {
    if (!req.body.medicine || typeof req.body.medicine !== 'object') {
        return res.status(400).json({ success: false, error: "Invalid request body." });
    }

    const { name, generic, brand, type, dosage, unit, stock, batch, expiry } = req.body.medicine;

    if (!name || !generic || !dosage || !unit || stock === undefined || !batch || !expiry) {
        return res.status(400).json({ success: false, error: "All required medicine fields must be provided." });
    }

    if (isNaN(Number(stock)) || Number(stock) < 0) {
        return res.status(400).json({ success: false, error: "Stock level must be a valid non-negative number." });
    }

     try {
        const { error: medicineError }= await supabase.from("medicines").insert({
            medicine_name: name,
            generic_name: generic,
            brand,
            type,
            dosage,
            unit_of_measure: unit,
            stock_level: stock,
            batch_number: batch,
            expiry_date: expiry
        });
        if(medicineError) {
           return res.status(500).json({ success: false, error: medicineError.message });
        }
        // Audit trail (fire-and-forget)
        const profile = req.userProfile;
        logActivity({
            actor_id: profile.id,
            actor_name: `${profile.first_name} ${profile.last_name}`,
            actor_role: profile.role,
            action: "medicine_added",
            entity_type: "medicine",
            entity_id: null,
            description: `Added medicine: ${name} (${generic || 'N/A'})`,
            metadata: { medicine_name: name, generic_name: generic, brand, stock },
        });

        return res.status(200).json({ success: true });
     } catch (err) {
        console.error(`Something went wrong inserting medicine: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
     }
}


const getMedicines = async (req, res) => {
    try {
        const { data: medicinesData, error: medicinesError } = await supabase.from("medicines")
        .select("*");
        
        if(medicinesError) {
            console.error(`Error getting medicines: ${medicinesError.message}`);
            return res.status(500).json({ success: false, error: medicinesError.message });
        }
        res.status(200).json({ success: true, data: medicinesData });
    } catch (err ) {
        console.error(`Something went wrong getting medicines: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
}

const updateMedicine = async (req, res) => {
    if (!req.body.medicine || typeof req.body.medicine !== 'object') {
        return res.status(400).json({ success: false, error: "Invalid request body." });
    }

    const { id, medicine_name, generic_name, brand, type, dosage, unit_of_measure, stock_level, batch_number, expiry_date } = req.body.medicine;

    if (!id) {
        return res.status(400).json({ success: false, error: "Medicine ID is required." });
    }
    if (!medicine_name || !generic_name || !dosage || !unit_of_measure || stock_level === undefined || !batch_number || !expiry_date) {
        return res.status(400).json({ success: false, error: "All required medicine fields must be provided." });
    }

     try {
        const { error: updateMedicineError } = await supabase.from("medicines").update({
            medicine_name,
            generic_name,
            brand,
            type,
            dosage,
            unit_of_measure,
            stock_level,
            batch_number,
            expiry_date,
        }).eq("id", id);

        if(updateMedicineError) {
            console.error(`Error updating medicine: ${updateMedicineError.message}`);
            return res.status(500).json({ success: false, error: updateMedicineError.message });
        }
        // Audit trail (fire-and-forget)
        const profile = req.userProfile;
        logActivity({
            actor_id: profile.id,
            actor_name: `${profile.first_name} ${profile.last_name}`,
            actor_role: profile.role,
            action: "medicine_updated",
            entity_type: "medicine",
            entity_id: String(id),
            description: `Updated medicine: ${medicine_name}`,
            metadata: { medicine_name, stock_level, dosage },
        });

        return res.status(200).json({ success: true, message: "update medicine success"});
    } catch (err) {
        console.error(`Something went wrong updating medicine: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
}

const deleteMedicine = async (req, res) => {
    const { medicineId } = req.params;

    if (!medicineId) {
        return res.status(400).json({ success: false, error: "Medicine ID is required." });
    }

    try {
        const { error: deleteMedicineError } = await supabase.from("medicines").delete().eq("id", medicineId);
        
        if(deleteMedicineError){
            console.error(`Error deleting medicine: ${deleteMedicineError.message}`);
            return res.status(500).json({ success: false, error: deleteMedicineError.message });
        }
        // Audit trail (fire-and-forget)
        const profile = req.userProfile;
        logActivity({
            actor_id: profile.id,
            actor_name: `${profile.first_name} ${profile.last_name}`,
            actor_role: profile.role,
            action: "medicine_deleted",
            entity_type: "medicine",
            entity_id: String(medicineId),
            description: `Deleted medicine (ID: ${medicineId})`,
            metadata: { medicine_id: medicineId },
        });

        return res.status(200).json({ success: true, message: "delete medicine success" });
    } catch (err) {
        console.error(`Somethinng went wrong deleting medicine :${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
}

module.exports = {insertMedicine, getMedicines, updateMedicine, deleteMedicine}