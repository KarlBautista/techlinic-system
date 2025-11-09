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
        quantity,
        treatment,
        notes
    } = req.body.formData;

    try{
        const { data: patientData, error: patientError } = await supabase.from("patients").insert({
            first_name: firstName,
            last_name: lastName,
            student_id: studentId,
            contact_number: contactNumber,
            year_level: yearLevel,
            department,
            sex,
            email
        }).select();
        if(patientError){
            console.error(`Error inserting record: ${patientError.message}`);
            return res.status(500).json({ success: false, error: patientError.message });
        }

        const patientId = patientData && patientData.length ? patientData[0].id : null;
        if(!patientId){
            console.error('Inserted patient data missing id', patientData);
            return res.status(500).json({ success: false, error: 'Failed to retrieve patient id after insert' });
        }
        
        const { data: diagnosisData, error: diagnosisError } = await supabase.from("diagnoses").insert({
            patient_id: patientId,
            diagnosis,
            medication,
            quantity,
            treatment,
            notes
        }).select();

        if(diagnosisError){
            console.error(`Error inserting diagnosis :${diagnosisError.message}`);
            return res.status(500).json({ success: false, error: diagnosisError.message });
        }

        return res.status(200).json({ success: true, data: { patient: patientData, diagnosis: diagnosisData } });

    } catch (err) {
        console.error(`Error inserting record: ${err.message}`);
        res.status(500).json({ success: false, error: err.message });
    }
}

const getRecords = async (req, res) => {
    try {
        const { data: patientsRecordData, error:patientsRecordError } = await supabase.from("patients").select("*, diagnoses (*)");
        if(patientsRecordError){
            console.error(`Error getting records: ${patientsInformationError.message}`);
            res.status(500).json({ success: false, error: patientsInformationError.message });
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

module.exports = { insertRecord, getRecords }