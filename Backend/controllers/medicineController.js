const supabase = require("../config/supabaseClient");

const insertMedicine = async (req, res) => {
    const { name,
            generic,
            brand,
            type,
            dosage,
            unit,
            stock,
            batch,
            expiry
     } = req.body.medicine;
     console.log(req.body);

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
        res.status(200).json({ success: true })
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

module.exports = {insertMedicine, getMedicines }