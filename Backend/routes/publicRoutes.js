const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseAdmin");

// ── Validation helpers ──
const VALID_YEAR_LEVELS = ['1st year', '2nd year', '3rd year', '4th year', '1', '2', '3', '4'];
const VALID_DEPARTMENTS = [
    "College of Science",
    "College of Engineering",
    "College of Industrial Technology",
    "College of Architecture and Fine Arts",
    "College of Industrial Education",
    "College of Liberal Arts"
];
const VALID_SEX = ['Male', 'Female'];

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidStudentId = (id) => /^[A-Z0-9-]+$/i.test(id) && id.length <= 20;
const isValidContactNumber = (num) => /^[0-9+\-() ]{7,15}$/.test(num);

// ── Public: Patient self-registration from LandingPage (no auth required) ──
router.post("/public/register-patient", async (req, res) => {
    const formData = req.body.formData;
    if (!formData || typeof formData !== 'object') {
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
        address,
        dateOfBirth
    } = formData;

    // Validate required fields
    if (!firstName || !lastName || !studentId || !contactNumber || !yearLevel || !department || !sex || !email || !address || !dateOfBirth) {
        return res.status(400).json({ success: false, error: "All fields are required." });
    }

    // Validate formats
    if (!isValidStudentId(studentId)) {
        return res.status(400).json({ success: false, error: "Invalid Student ID format." });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, error: "Invalid email address." });
    }
    if (!isValidContactNumber(contactNumber)) {
        return res.status(400).json({ success: false, error: "Invalid contact number." });
    }
    if (!VALID_SEX.includes(sex)) {
        return res.status(400).json({ success: false, error: "Invalid sex value." });
    }
    if (!VALID_DEPARTMENTS.includes(department)) {
        return res.status(400).json({ success: false, error: "Invalid department." });
    }
    if (!VALID_YEAR_LEVELS.includes(yearLevel)) {
        return res.status(400).json({ success: false, error: "Invalid year level." });
    }
    if (String(firstName).length > 100 || String(lastName).length > 100 || String(address).length > 500) {
        return res.status(400).json({ success: false, error: "Field length exceeds maximum allowed." });
    }

    // Sanitize string inputs
    const clean = (str) => String(str).trim();

    try {
        // Insert into records table (self-registration = INCOMPLETE, no physician)
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
            attending_physician: null,
            attending_physician_id: null,
            status: "INCOMPLETE"
        }).select();

        if (recordError) {
            console.error(`Error inserting record: ${recordError.message}`);
            return res.status(500).json({ success: false, error: recordError.message });
        }

        // Insert into patients table (ignore duplicate errors)
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

        if (patientError) {
            console.log("Patient already exists or insert note:", patientError.message);
        }

        return res.status(200).json({ success: true, data: { patient: recordData } });

    } catch (err) {
        console.error(`Error in public register-patient: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ── Public: Check if student exists (for auto-fill on LandingPage) ──
router.get("/public/check-student/:studentId", async (req, res) => {
    const { studentId } = req.params;

    if (!studentId || !studentId.trim()) {
        return res.status(400).json({ success: false, error: "Student ID is required." });
    }

    if (!isValidStudentId(studentId)) {
        return res.status(400).json({ success: false, error: "Invalid Student ID format." });
    }

    try {
        const { data, error } = await supabase
            .from("patients")
            .select("first_name, last_name, student_id, contact_number, year_level, department, sex, email, address, date_of_birth")
            .eq("student_id", studentId);

        if (error) {
            console.error(`Error checking student: ${error.message}`);
            return res.status(500).json({ success: false, error: error.message });
        }

        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error(`Error in public check-student: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
