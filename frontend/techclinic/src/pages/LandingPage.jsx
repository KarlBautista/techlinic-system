import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Check } from 'lucide-react';
import RegistrationInfo from '../components/registrationInfo';
import Dropdown from '../components/Dropdown'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import { showToast } from '../components/Toast'
import { showModal } from '../components/Modal'
import TUP from '../assets/image/TUP.png'

// Constants
const INITIAL_FORM_DATA = {
    studentId: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    yearLevel: '',
    department: '',
    sex: '',
    email: '',
    address: '',
    dateOfBirth: ''
};

const YEAR_OPTIONS = ['1st year', '2nd year', '3rd year', '4th year'];
const DEPARTMENT_OPTIONS = [
    "College of Science",
    "College of Engineering",
    "College of Industrial Technology",
    "College of Architecture and Fine Arts",
    "College of Industrial Education",
    "College of Liberal Arts"
];
const SEX_OPTIONS = ['Male', 'Female'];
const PRIMARY_COLOR = "#B22222";
const REQUIRED_FIELDS = ['studentId', 'firstName', 'lastName', 'contactNumber', 'yearLevel', 'department', 'sex', 'email', 'address', 'dateOfBirth'];
const PATIENT_ID_REGEX = /^[A-Z0-9-]+$/;
const NAME_REGEX = /^[A-Za-zÑñ][A-Za-zÑñ\s'.-]*$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_REGEX = /^[0-9+\-() ]{7,15}$/;

const STEPS = [
    { number: 1, label: 'Personal Details' },
    { number: 2, label: 'Contact & Academic' },
    { number: 3, label: 'Review & Submit' }
];

function LandingPage() {
    const navigate = useNavigate();
    const API_BASE = 'http://localhost:3500/api';

    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [isStudentConfirmed, setIsStudentConfirmed] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});

    // Format date from various formats to MM/DD/YY
    const formatDateToMMDDYY = (dateString) => {
        if (!dateString) return '';

        let datePart = dateString.includes('T') ? dateString.split('T')[0] : dateString;

        // Handle YYYY-MM-DD format
        if (datePart.includes('-')) {
            const [year, month, day] = datePart.split('-');
            return `${month}/${day}/${year}`;
        }

        // Handle MM/DD/YYYY format - already in correct format
        return datePart;
    };

    // Convert date to HTML input format (YYYY-MM-DD)
    const convertToInputFormat = (dateString) => {
        if (!dateString) return '';

        // Already in correct format
        if (dateString.includes('-') && !dateString.includes('/')) {
            return dateString;
        }

        // Convert from MM/DD/YYYY to YYYY-MM-DD
        if (dateString.includes('/')) {
            const parts = dateString.split('/');
            if (parts.length === 3) {
                const [month, day, year] = parts;
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }

        return dateString;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'studentId') {
            const validatedValue = value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
            setFormData((prev) => ({ ...prev, [name]: validatedValue }));
            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleStudentIdBlur = async () => {
        if (!formData.studentId.trim()) {
            return;
        }

        try {
            const res = await axios.get(`${API_BASE}/public/check-student/${formData.studentId}`);
            const response = res.data;

            if (response.success && response.data && response.data.length > 0) {
                const studentData = response.data[0];

                const confirmed = await showModal({
                    title: "Confirm Identity",
                    message: `Are you ${studentData.first_name} ${studentData.last_name}?`,
                    type: "info",
                    confirmLabel: "Yes, that's me",
                    cancelLabel: "No, enter manually",
                    showCancel: true,
                });

                if (confirmed) {
                    const formattedDate = formatDateToMMDDYY(studentData.date_of_birth);
                    const inputDate = convertToInputFormat(formattedDate);

                    setFormData((prev) => ({
                        ...prev,
                        firstName: studentData.first_name || prev.firstName,
                        lastName: studentData.last_name || prev.lastName,
                        contactNumber: studentData.contact_number || prev.contactNumber,
                        yearLevel: studentData.year_level || prev.yearLevel,
                        department: studentData.department || prev.department,
                        sex: studentData.sex || prev.sex,
                        email: studentData.email || prev.email,
                        address: studentData.address || prev.address,
                        dateOfBirth: inputDate || prev.dateOfBirth,
                    }));

                    setIsStudentConfirmed(true);

                    showToast({
                        title: "Success",
                        message: `Information for ${studentData.first_name} ${studentData.last_name} loaded successfully`,
                        type: "success",
                    });
                }
            }
        } catch (err) {
            console.error("Error searching for student:", err);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const trimmed = {
            studentId: formData.studentId.trim(),
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            contactNumber: formData.contactNumber.trim(),
            address: formData.address.trim(),
        };

        if (!trimmed.studentId || !trimmed.firstName || !trimmed.lastName || !trimmed.contactNumber ||
            !formData.yearLevel || !formData.department || !formData.sex || !trimmed.email ||
            !trimmed.address || !formData.dateOfBirth) {
            showToast({
                title: "Incomplete Form",
                message: "Please fill out all required fields before submitting.",
                type: "warning"
            });
            return;
        }

        if (!PATIENT_ID_REGEX.test(trimmed.studentId)) {
            showToast({
                title: "Invalid Patient ID",
                message: "Patient ID must contain only letters, numbers, and hyphens.",
                type: "warning"
            });
            return;
        }

        if (!NAME_REGEX.test(trimmed.firstName) || !NAME_REGEX.test(trimmed.lastName)) {
            showToast({
                title: "Invalid Name",
                message: "First Name and Last Name contain invalid characters.",
                type: "warning"
            });
            return;
        }

        // Validate email format
        if (!EMAIL_REGEX.test(trimmed.email)) {
            showToast({
                title: "Invalid Email",
                message: "Please enter a valid email address.",
                type: "warning"
            });
            return;
        }

        // Validate contact number
        if (!CONTACT_REGEX.test(trimmed.contactNumber)) {
            showToast({
                title: "Invalid Contact Number",
                message: "Please enter a valid contact number (7-15 digits).",
                type: "warning"
            });
            return;
        }

        const confirmed = await showModal({
            title: "Submit Registration?",
            message: "Are you sure you want to submit your registration?",
            type: "info",
            confirmLabel: "Confirm",
            cancelLabel: "Cancel",
            showCancel: true,
        });

        if (confirmed) {
            try {
                const dataToSubmit = {
                    ...formData,
                    dateOfBirth: formatDateToMMDDYY(formData.dateOfBirth)
                };
                const res = await axios.post(`${API_BASE}/public/register-patient`, { formData: dataToSubmit });
                const response = res.data;
                if (!response.success) {
                    const msg = response.error || 'Failed inserting record';
                    const lower = String(msg).toLowerCase();
                    if (lower.includes('unique') || lower.includes('duplicate') || lower.includes('already exists') || lower.includes('student_id') || lower.includes('student id')) {
                        showToast({
                            title: "Patient Already Exists",
                            message: "A patient with this Patient ID already exists. Please check the Patient ID.",
                            type: "warning"
                        });
                    } else {
                        showToast({
                            title: "Something went wrong",
                            message: msg,
                            type: "error"
                        });
                    }
                    return;
                } else {
                    setFormData(INITIAL_FORM_DATA);
                    setIsStudentConfirmed(false);
                    setCurrentStep(1);
                    setErrors({});

                    showToast({
                        title: "Record Inserted Successfully",
                        type: "success",
                    });
                }
            } catch (err) {
                console.error(err);
                const msg = err?.response?.data?.error || "An error occurred while submitting the form";
                const lower = String(msg).toLowerCase();
                if (lower.includes('unique') || lower.includes('duplicate') || lower.includes('already exists') || lower.includes('student_id') || lower.includes('student id')) {
                    showToast({
                        title: "Patient Already Exists",
                        message: "A patient with this Patient ID already exists. Please check the Patient ID.",
                        type: "warning"
                    });
                } else {
                    showToast({
                        title: "Error",
                        message: msg,
                        type: "error"
                    });
                }
            }
        }
    };

    const handleLog = async () => {
        const confirmed = await showModal({
            title: "Clinic Personnel Confirmation",
            message: "This page is for clinic personnel only. Are you a clinic personnel?",
            type: "info",
            confirmLabel: "Yes",
            cancelLabel: "No",
            showCancel: true,
        });
        if (confirmed) {
            navigate('/login');
        }
    }

    const handleClear = () => {
        setFormData({
            studentId: '',
            firstName: '',
            lastName: '',
            contactNumber: '',
            yearLevel: '',
            department: '',
            sex: '',
            email: '',
            address: '',
            dateOfBirth: ''
        });
        setIsStudentConfirmed(false);
        setCurrentStep(1);
        setErrors({});
    }

    const validateStep = (step) => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.studentId.trim()) newErrors.studentId = 'Patient ID is required';
            else if (!PATIENT_ID_REGEX.test(formData.studentId.trim())) newErrors.studentId = 'Patient ID must contain only letters, numbers, and hyphens';

            if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
            else if (!NAME_REGEX.test(formData.firstName.trim())) newErrors.firstName = 'First name contains invalid characters';

            if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
            else if (!NAME_REGEX.test(formData.lastName.trim())) newErrors.lastName = 'Last name contains invalid characters';

            if (!formData.sex) newErrors.sex = 'Please select sex';
            if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Please enter date of birth';
        }
        if (step === 2) {
            if (!formData.email.trim()) newErrors.email = 'Email is required';
            else if (!EMAIL_REGEX.test(formData.email.trim())) newErrors.email = 'Please enter a valid email';

            if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
            else if (!CONTACT_REGEX.test(formData.contactNumber.trim())) newErrors.contactNumber = 'Please enter a valid contact number';

            if (!formData.address.trim()) newErrors.address = 'Address is required';
            if (!formData.department) newErrors.department = 'Please select a department';
            if (!formData.yearLevel) newErrors.yearLevel = 'Please select a year level';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
            setErrors({});
        } else {
            showToast({
                title: "Validation Error",
                message: "Please correct the highlighted fields before proceeding.",
                type: "warning"
            });
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
        setErrors({});
    };

    const ReviewField = ({ label, value }) => (
        <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 font-medium">{label}</p>
            <p className="text-sm text-gray-800 font-medium mt-0.5">{value || '—'}</p>
        </div>
    );

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-[#fff7f7] via-[#ffffff] to-[#fffaf2]">
            {/* ─── Top Bar ─── */}
            <div className="flex items-center justify-between px-6 md:px-10 py-4">
                <div className="flex items-center gap-3">
                    <img src={TUP} alt="TUP" className="w-9 h-9" />
                    <span className="text-lg font-bold text-gray-800">TechClinic</span>
                </div>
                <button
                    onClick={handleLog}
                    className="text-sm text-gray-500 hover:text-crimson-600 transition-colors cursor-pointer"
                >
                    Clinic Personnel?&nbsp;
                    <span className="font-semibold text-crimson-600 hover:underline">Login</span>
                </button>
            </div>

            {/* ─── Content ─── */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-6"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Patient Registration</h1>
                    <p className="text-gray-500 mt-2 text-sm">Kindly provide the necessary details before continuing.</p>
                </motion.div>

                {/* ─── Stepper ─── */}
                <div className="flex items-center justify-center mb-8">
                    {STEPS.map((step, index) => (
                        <div key={step.number} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300
                                        ${currentStep > step.number
                                            ? 'bg-crimson-600 border-crimson-600 text-white'
                                            : currentStep === step.number
                                                ? 'border-crimson-600 text-crimson-600 bg-white'
                                                : 'border-gray-300 text-gray-400 bg-white'}`}
                                >
                                    {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                                </div>
                                <span
                                    className={`text-xs mt-2 font-medium whitespace-nowrap transition-colors
                                        ${currentStep >= step.number ? 'text-crimson-600' : 'text-gray-400'}`}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={`w-16 md:w-28 h-0.5 mx-3 mb-5 transition-all duration-300
                                        ${currentStep > step.number ? 'bg-crimson-600' : 'bg-gray-200'}`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* ─── Form Card ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="w-full max-w-2xl"
                >
                    <div className="bg-white rounded-2xl shadow-lg shadow-rose-100/30 ring-1 ring-gray-200 p-6 md:p-8">
                        <AnimatePresence mode="wait">
                            {/* ══ Step 1: Personal Details ══ */}
                            {currentStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
                                >
                                    <div className="md:col-span-2">
                                        <RegistrationInfo message="Patient ID*" name="studentId" value={formData.studentId} onChange={handleInputChange} onBlur={handleStudentIdBlur} showValidation={!!errors.studentId} disabled={isStudentConfirmed} lightOnly />
                                        {errors.studentId && <p className="text-xs text-red-500 mt-1 pl-1">{errors.studentId}</p>}
                                    </div>
                                    <div>
                                        <RegistrationInfo message="First Name*" name="firstName" value={formData.firstName} onChange={handleInputChange} showValidation={!!errors.firstName} disabled={isStudentConfirmed} lightOnly />
                                        {errors.firstName && <p className="text-xs text-red-500 mt-1 pl-1">{errors.firstName}</p>}
                                    </div>
                                    <div>
                                        <RegistrationInfo message="Last Name*" name="lastName" value={formData.lastName} onChange={handleInputChange} showValidation={!!errors.lastName} disabled={isStudentConfirmed} lightOnly />
                                        {errors.lastName && <p className="text-xs text-red-500 mt-1 pl-1">{errors.lastName}</p>}
                                    </div>
                                    <div>
                                        <Dropdown name="sex" options={SEX_OPTIONS} placeholder="Sex*" value={formData.sex} onChange={handleInputChange} showValidation={!!errors.sex} disabled={isStudentConfirmed} lightOnly />
                                        {errors.sex && <p className="text-xs text-red-500 mt-1 pl-1">{errors.sex}</p>}
                                    </div>
                                    <div>
                                        <RegistrationInfo type="date" message="Date of Birth*" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} showValidation={!!errors.dateOfBirth} disabled={isStudentConfirmed} lightOnly />
                                        {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1 pl-1">{errors.dateOfBirth}</p>}
                                    </div>
                                </motion.div>
                            )}

                            {/* ══ Step 2: Contact & Academic ══ */}
                            {currentStep === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
                                >
                                    <div>
                                        <RegistrationInfo message="Email Address*" name="email" value={formData.email} onChange={handleInputChange} showValidation={!!errors.email} disabled={isStudentConfirmed} lightOnly />
                                        {errors.email && <p className="text-xs text-red-500 mt-1 pl-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <RegistrationInfo message="Contact Number*" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} showValidation={!!errors.contactNumber} disabled={isStudentConfirmed} lightOnly />
                                        {errors.contactNumber && <p className="text-xs text-red-500 mt-1 pl-1">{errors.contactNumber}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <RegistrationInfo message="Address*" name="address" value={formData.address} onChange={handleInputChange} showValidation={!!errors.address} disabled={isStudentConfirmed} lightOnly />
                                        {errors.address && <p className="text-xs text-red-500 mt-1 pl-1">{errors.address}</p>}
                                    </div>
                                    <div>
                                        <Dropdown name="department" options={DEPARTMENT_OPTIONS} placeholder="Department*" value={formData.department} onChange={handleInputChange} showValidation={!!errors.department} disabled={isStudentConfirmed} lightOnly />
                                        {errors.department && <p className="text-xs text-red-500 mt-1 pl-1">{errors.department}</p>}
                                    </div>
                                    <div>
                                        <Dropdown name="yearLevel" options={YEAR_OPTIONS} placeholder="Year Level*" value={formData.yearLevel} onChange={handleInputChange} showValidation={!!errors.yearLevel} disabled={isStudentConfirmed} lightOnly />
                                        {errors.yearLevel && <p className="text-xs text-red-500 mt-1 pl-1">{errors.yearLevel}</p>}
                                    </div>
                                </motion.div>
                            )}

                            {/* ══ Step 3: Review & Submit ══ */}
                            {currentStep === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.25 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <ReviewField label="Patient ID" value={formData.studentId} />
                                            <ReviewField label="First Name" value={formData.firstName} />
                                            <ReviewField label="Last Name" value={formData.lastName} />
                                            <ReviewField label="Sex" value={formData.sex} />
                                            <ReviewField label="Date of Birth" value={formatDateToMMDDYY(formData.dateOfBirth)} />
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-5">
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contact & Academic</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <ReviewField label="Email" value={formData.email} />
                                            <ReviewField label="Contact Number" value={formData.contactNumber} />
                                            <ReviewField label="Address" value={formData.address} />
                                            <ReviewField label="Department" value={formData.department} />
                                            <ReviewField label="Year Level" value={formData.yearLevel} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ─── Navigation Buttons ─── */}
                    <div className="flex items-center justify-between mt-6">
                        {currentStep > 1 ? (
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleBack}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                Back
                            </motion.button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-sm text-gray-400 hover:text-crimson-600 transition-colors cursor-pointer"
                            >
                                Clear all
                            </button>
                        )}

                        {currentStep < 3 ? (
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleNext}
                                className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-crimson-600 text-white text-sm font-medium tracking-wider hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer"
                            >
                                Next
                            </motion.button>
                        ) : (
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleFormSubmit}
                                className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-crimson-600 text-white text-sm font-medium tracking-wider hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer"
                            >
                                Submit
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default LandingPage;
