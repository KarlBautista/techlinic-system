const supabase = require("../config/supabaseClient");

const insertRecord = async (req, res) => {
    const {
        firstName,
        lastName,
        studentId,
        contactNumber,
        yearLevel,
        department,
        sex,
        email,
        diagnosis,
        medication,
        address,
        dateOfBirth,
        quantity,
        treatment,
        notes,
        attendingPhysician
    } = req.body.formData;
    console.log("Medication received:", medication);
console.log("Stock level:", medication.stock_level);
console.log("Quantity:", quantity);


    try{
        const { data: recordData, error: recordError } = await supabase.from("records").insert({
            first_name: firstName,
            last_name: lastName,
            student_id: studentId,
            contact_number: contactNumber,
            year_level: yearLevel,
            department,
            sex,
            email,
            address,
            date_of_birth: dateOfBirth,
            attending_physician: attendingPhysician,
            status:  (diagnosis === "" || medication === "" || quantity === "" || treatment === "" || notes === "") ? "INCOMPLETE" : "COMPLETE"
        }).select();
        if(recordError){
            console.error(`Error inserting record: ${recordError.message}`);
            res.status(500).json({ success: false, error: recordError.message });
        }

        const recordId = recordData && recordData.length ? recordData[0].id : null;
        if(!recordId){
            console.error('Inserted patient data missing id', recordData);
             res.status(500).json({ success: false, error: 'Failed to retrieve patient id after insert' });
        }

        const { error: patientError } = await supabase.from("patients").insert({
            first_name: firstName,
            last_name: lastName,
            student_id: studentId,
            contact_number: contactNumber,
            year_level: yearLevel,
            department,
            sex,
            email,
            address,
            date_of_birth: dateOfBirth
        });
        
        if(patientError){
            console.log("Patient is already in patient data: ", patientError.message);
        }
        
        
        const { data: diagnosisData, error: diagnosisError } = await supabase.from("diagnoses").insert({
            record_id: recordId,
            student_id :studentId,
            diagnosis,
            medication: medication.medicine_name,
            quantity,
            treatment,
            notes
        }).select();

        if(diagnosisError){
            console.error(`Error inserting diagnosis :${diagnosisError.message}`);
            return res.status(500).json({ success: false, error: diagnosisError.message });
        }

        if(diagnosis !== "") {
            const { error: decreaseMedicationStockQuantityError } = await supabase.from("medicines").update({
                "stock_level": Number(medication.stock_level) - Number(quantity)
            }).eq("id", medication.id);

            if(decreaseMedicationStockQuantityError) {
                console.error(`Error updating stock level: ${decreaseMedicationStockQuantityError.message}`);
            }
        }

        return res.status(200).json({ success: true, data: { patient: recordData, diagnosis: diagnosisData } });

    } catch (err) {
        console.error(`Error inserting record: ${err.message}`);
        res.status(500).json({ success: false, error: err.message });
    }
}

const getRecords = async (req, res) => {
    try {
        const { data: patientsRecordData, error:patientsRecordError } = await supabase.from("records").select("*, diagnoses (*)");
        if(patientsRecordError){
            console.error(`Error getting records: ${patientsInformationError.message}`);
            return res.status(500).json({ success: false, error: patientsInformationError.message });
        }

        if(patientsRecordData){
            console.log("successfully got the patient records");
             res.status(200).json({ success: true, data: patientsRecordData });
        }

    } catch (err) {
        console.error(`Error getting records: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
}
const getRecord = async (req, res) => {
    const { studentId } = req.params;
    console.log(req.params);
    try {
        const { data: patientRecordData, error: patientRecordError } = await supabase.from("records").select("*, diagnoses (*)")
        .eq("student_id", studentId);
        
        if(patientRecordError) {
            console.error(`Error getting record: ${patientRecordError.message}`);
            res.status(500).json({ success: false, error: patientRecordError.message });
        }
        res.status(200).json({ success: true, data: patientRecordData });
    } catch (err) {
        console.error(`Something went wrong getting record :${err.message}`);
        res.status(500).json({ success: false, error: err.message });
     }
}

const getRecordsFromExisitingPatients = async (req, res) => {
    const studentId = req.params.studentId;
    console.log(studentId)
    try {
        const { data: patientInformationData, error: patientInformationError } = await supabase.from("patients").select("*")
        .eq("student_id", studentId);

        if(patientInformationError) {
            console.error(`Error getting patient information :${patientInformationError.message}`);
            res.status(500).json({ success: false, error: patientInformationError.message });
        }
        res.status(200).json({ success: true, data: patientInformationData });
    } catch (err) {
        console.error(`Something went wrong getting patient information`);
        res.status(500).json({ success: false, error: err.message });
    }
}

const getPatients = async (req, res) => {
    console.log("gumaganaaa akooo")
    try {
        const { data: patientsData, error: patientsError } = await supabase.from("patients").select("*");
        if(patientsError) {
            console.error(`Error getting patients: ${patientsError.message}`);
            return res.status(500).json({ success: false, error: patientsError.message });
        }
        console.log("nakuha ko naaaa", patientsData)
        res.status(200).json({ success: true, data: patientsData })
    } catch (err) {
        console.error(`Something went wrong getting patients: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
}



module.exports = { insertRecord, getRecords, getRecord, getRecordsFromExisitingPatients, getPatients }