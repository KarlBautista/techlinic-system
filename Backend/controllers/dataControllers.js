const supabase = require("../config/supabaseAdmin");
const supabaseAdmin = require("../config/supabaseAdmin")

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidStudentId = (id) => /^[A-Z0-9-]+$/i.test(id) && id.length <= 20;

const insertRecord = async (req, res) => {
    if (!req.body.formData || typeof req.body.formData !== 'object') {
        return res.status(400).json({ success: false, error: "Invalid request body." });
    }

    const {
        firstName,
        lastName,
        studentId,
        contactNumber,
        yearLevel,
        department,
        sex,
        email,
        diseaseId,
        diagnosis,
        medication,
        address,
        dateOfBirth,
        quantity,
        treatment,
        notes,
        attendingPhysician,
        attendingPhysicianId,
        physicianSignatureUrl
    } = req.body.formData;

    // Validate required patient fields
    if (!firstName || !lastName || !studentId || !contactNumber || !yearLevel || !department || !sex || !email || !address || !dateOfBirth) {
        return res.status(400).json({ success: false, error: "All patient information fields are required." });
    }

    if (!isValidStudentId(studentId)) {
        return res.status(400).json({ success: false, error: "Invalid Student ID format." });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, error: "Invalid email address." });
    }

    const clean = (str) => str ? String(str).trim() : str;
    
    try{
        const { data: recordData, error: recordError } = await supabase.from("records").insert({
            first_name: clean(firstName),
            last_name: clean(lastName),
            student_id: clean(studentId),
            contact_number: clean(contactNumber),
            year_level: yearLevel,
            department,
            sex,
            email: clean(email),
            address: clean(address),
            date_of_birth: dateOfBirth,
            attending_physician: attendingPhysician ? clean(attendingPhysician) : null,
            attending_physician_id: attendingPhysicianId || null,
            status: (diagnosis === "" || !medication || quantity === "" || treatment === "" || notes === "") ? "INCOMPLETE" : "COMPLETE"
        }).select();
        
        if(recordError){
            console.error(`Error inserting record: ${recordError.message}`);
            return res.status(500).json({ success: false, error: recordError.message });
        }

        const recordId = recordData && recordData.length ? recordData[0].id : null;
        if(!recordId){
            console.error('Inserted patient data missing id', recordData);
            return res.status(500).json({ success: false, error: 'Failed to retrieve patient id after insert' });
        }

        const { error: patientError } = await supabase.from("patients").insert({
            first_name: clean(firstName),
            last_name: clean(lastName),
            student_id: clean(studentId),
            contact_number: clean(contactNumber),
            year_level: yearLevel,
            department,
            sex,
            email: clean(email),
            address: clean(address),
            date_of_birth: dateOfBirth
        });
        
        if(patientError){
            console.log("Patient is already in patient data: ", patientError.message);
        }
        
        let diagnosisData = null;
        
        // Check if we have both disease ID and diagnosis name
        const hasDiseaseId = diseaseId && String(diseaseId).trim() !== "";
        const hasDiagnosis = diagnosis && String(diagnosis).trim() !== "";
        
        if (hasDiseaseId && hasDiagnosis) {
            
            const diagnosisPayload = {
                record_id: recordId,
                student_id: studentId,
                disease_id: diseaseId,
                diagnosis: diagnosis,
                medication: medication?.medicine_name || null,
                quantity: quantity ? Number(quantity) : null,
                treatment: treatment || null,
                notes: notes || null,
                physician_signature_url: physicianSignatureUrl || null
            };
            
            const { data, error: diagnosisError } = await supabase
                .from("diagnoses")
                .insert(diagnosisPayload)
                .select();
            
            if(diagnosisError){
                console.error(`Error inserting diagnosis: ${diagnosisError.message}`);
                return res.status(500).json({ success: false, error: diagnosisError.message });
            }
            
            diagnosisData = data;
        } else {
        }

        // Update medication stock only if we have valid data
        if(hasDiagnosis && medication && medication.id && quantity && Number(quantity) > 0) {
            // Fetch current stock from DB to avoid stale data
            const { data: currentMedicine, error: fetchError } = await supabase
                .from("medicines")
                .select("stock_level")
                .eq("id", medication.id)
                .single();

            if (fetchError) {
                console.error(`Error fetching current stock: ${fetchError.message}`);
            } else {
                const currentStock = Number(currentMedicine.stock_level);
                const qty = Number(quantity);
                const newStockLevel = Math.max(0, currentStock - qty);

                if (currentStock < qty) {
                    console.warn(`Insufficient stock for medicine ${medication.id}: requested ${qty}, available ${currentStock}. Setting to 0.`);
                }

                const { error: decreaseMedicationStockQuantityError } = await supabase
                    .from("medicines")
                    .update({ stock_level: newStockLevel })
                    .eq("id", medication.id);

                if(decreaseMedicationStockQuantityError) {
                    console.error(`Error updating stock level: ${decreaseMedicationStockQuantityError.message}`);
                }
            }
        }

        return res.status(200).json({ 
            success: true, 
            data: { 
                patient: recordData, 
                diagnosis: diagnosisData 
            } 
        });

    } catch (err) {
        console.error(`Error inserting record: ${err.message}`);
        console.error('Full error:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

const getRecords = async (req, res) => {
    try {
        const { data: patientsRecordData, error:patientsRecordError } = await supabase.from("records").select("*, diagnoses (*)");
        if(patientsRecordError){
            console.error(`Error getting records: ${patientsRecordError.message}`);
            return res.status(500).json({ success: false, error: patientsRecordError.message });
        }

        if(patientsRecordData){
            return res.status(200).json({ success: true, data: patientsRecordData });
        }

    } catch (err) {
        console.error(`Error getting records: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
}
const getRecord = async (req, res) => {
    const { studentId } = req.params;
    try {
        const { data: patientRecordData, error: patientRecordError } = await supabase.from("records").select("*, diagnoses (*)")
        .eq("student_id", studentId);
        
        if(patientRecordError) {
            console.error(`Error getting record: ${patientRecordError.message}`);
            return res.status(500).json({ success: false, error: patientRecordError.message });
        }
        return res.status(200).json({ success: true, data: patientRecordData });
    } catch (err) {
        console.error(`Something went wrong getting record :${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
     }
}

const getRecordToDiagnose = async (req, res) => {
    const { recordId } = req.params;
    try {
        const { data: patientRecordData, error: patientRecordError } = await supabase.from("records").select("*")
        .eq("id", recordId);

        if (patientRecordError) {
            console.error(`Error getting patient record: ${patientRecordError.message}`);
            return res.status(500).json({ success: false, error: patientRecordError.message });
        }
        return res.status(200).json({ success: true, data: patientRecordData });
    }  catch (err) {
        console.error(`Something went wrong getting patient record: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
}
const getRecordsFromExisitingPatients = async (req, res) => {
    const studentId = req.params.studentId;
    try {
        const { data: patientInformationData, error: patientInformationError } = await supabase.from("patients").select("*")
        .eq("student_id", studentId);

        if(patientInformationError) {
            console.error(`Error getting patient information :${patientInformationError.message}`);
            return res.status(500).json({ success: false, error: patientInformationError.message });
        }
        return res.status(200).json({ success: true, data: patientInformationData });
    } catch (err) {
        console.error(`Something went wrong getting patient information: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
}

const getPatients = async (req, res) => {
    try {
        const { data: patientsData, error: patientsError } = await supabase.from("patients").select("*");
        if(patientsError) {
            console.error(`Error getting patients: ${patientsError.message}`);
            return res.status(500).json({ success: false, error: patientsError.message });
        }
        return res.status(200).json({ success: true, data: patientsData })
    } catch (err) {
        console.error(`Something went wrong getting patients: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
}

const addDiagnosis = async (req, res) => {
     const {
        id,
        firstName,
        lastName,
        studentId,
        contactNumber,
        yearLevel,
        department,
        sex,
        email,
        diseaseId,
        diagnosis,
        medication,
        address,
        dateOfBirth,
        quantity,
        treatment,
        notes,
        attendingPhysician,
        attendingPhysicianId,
        physicianSignatureUrl
    } = req.body.patientInput;

    if (!id || !diagnosis) {
        return res.status(400).json({ success: false, error: "Record ID and diagnosis are required." });
    }

    try {
        const { data: addDiagnosisData, error: addDiagnosisError } = await supabase.from("diagnoses").insert({
            diagnosis,
            record_id: id,
            medication: medication?.medicine_name ?? null,
            disease_id: diseaseId ? Number(diseaseId) : null,
            quantity: quantity ? Number(quantity) : null,
            treatment: treatment || null,
            notes: notes || null,
            physician_signature_url: physicianSignatureUrl || null,
        });

        if (addDiagnosisError) {
            console.error(`Error adding diagnosis: ${addDiagnosisError.message}`);
            res.status(500).json({ success: false, error: addDiagnosisError.message });
            return;
        }
        const updateData = { status: "COMPLETE" };
        if (attendingPhysician) updateData.attending_physician = attendingPhysician;
        if (attendingPhysicianId) updateData.attending_physician_id = attendingPhysicianId;
        const { error: updateCompleteStatusError } = await supabase.from("records").update(updateData).eq("id", id);
        
        if (updateCompleteStatusError) {
            console.error(`Error update status: ${updateCompleteStatusError}`);
            return res.status(500).json({ success: false, error: updateCompleteStatusError.message });
        }

        // Decrement medication stock
        if (medication && medication.id && quantity && Number(quantity) > 0) {
            const { data: currentMedicine, error: fetchError } = await supabase
                .from("medicines")
                .select("stock_level")
                .eq("id", medication.id)
                .single();

            if (fetchError) {
                console.error(`Error fetching current stock: ${fetchError.message}`);
            } else {
                const currentStock = Number(currentMedicine.stock_level);
                const qty = Number(quantity);
                const newStockLevel = Math.max(0, currentStock - qty);

                const { error: stockError } = await supabase
                    .from("medicines")
                    .update({ stock_level: newStockLevel })
                    .eq("id", medication.id);

                if (stockError) {
                    console.error(`Error updating stock level: ${stockError.message}`);
                }
            }
        }

        return res.status(200).json({ success: true, message: "success diagnosis"});
    } catch (err) {
        console.error(`Something went wrong adding diagnosis: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const { data: allUsersData, error: allUsersError } = await supabase.from("users").select("*");
        if (allUsersError) {
            console.error(`Error getting all users: ${allUsersError.message}`);
            return res.status(500).json({ success: false, error: allUsersError.message });
        }
        return res.status(200).json({ success: true, data: allUsersData });
    } catch (err) {
        console.error(`Error getting all users: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
}

const insertPersonnel = async (req, res) => {
    if (!req.body.personnel || typeof req.body.personnel !== 'object') {
        return res.status(400).json({ success: false, error: "Invalid request body." });
    }

    const { first_name, last_name, email, password, address, date_of_birth, role, sex } = req.body.personnel;

    if (!first_name || !last_name || !email || !password || !role || !sex) {
        return res.status(400).json({ success: false, error: "All required personnel fields must be provided." });
    }

    const validRoles = ['DOCTOR', 'NURSE'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, error: "Invalid role. Must be DOCTOR or NURSE." });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, error: "Invalid email address." });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, error: "Password must be at least 6 characters." });
    }

    try {
       
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, 
        });

        if (authError) {
            console.error(`Error creating auth user: ${authError.message}`);
            return res.status(500).json({ 
                success: false, 
                error: authError.message 
            });
        }

        
        const { data: userData, error: insertUserError } = await supabase
            .from("users")
            .insert({
                id: authData.user.id, 
                first_name: first_name,
                last_name: last_name,
                email: email,
                address: address,
                date_of_birth: date_of_birth,
                role: role,
                sex: sex
            })
            .select()
            .single();

        if (insertUserError) {
            console.error(`Error inserting user data: ${insertUserError.message}`);
            
            await supabase.auth.admin.deleteUser(authData.user.id);
            
            return res.status(500).json({ 
                success: false, 
                error: insertUserError.message 
            });
        }

       
        return res.status(201).json({ 
            success: true, 
            message: "Personnel added successfully",
            data: {
                user_id: userData.id,
                email: userData.email,
                full_name: `${userData.first_name} ${userData.last_name}`,
                role: userData.role
            }
        });

    } catch (err) {
        console.error(`Something went wrong adding personnel: ${err.message}`);
        return res.status(500).json({ 
            success: false, 
            error: err.message 
        });
    }
};





module.exports = { insertRecord, getRecords, getRecord, getRecordsFromExisitingPatients, getPatients, getRecordToDiagnose, addDiagnosis, getAllUsers, insertPersonnel}