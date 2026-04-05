import React from 'react'
import { useState } from 'react'
import useData from '../store/useDataStore'
import useAuth from '../store/useAuthStore'
import { useLocation } from 'react-router-dom'
import { showToast } from '../components/Toast'
import { showModal } from '../components/Modal'
import { useEffect } from 'react'
import useMedicine from "../store/useMedicineStore";
import api from '../lib/api'
import emailjs from '@emailjs/browser'
import { FormSkeleton, ButtonLoader } from '../components/PageLoader'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, ClipboardList, Plus, X, FileText, StickyNote, Check, Send } from 'lucide-react'
import Dropdown from '../components/Dropdown'
import tupLogo from '../assets/image/TUP.png'
import { validatePatientForm, hasErrors, LIMITS } from '../lib/validation'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const PRESC_TMPL = import.meta.env.VITE_EMAILJS_PRESCRIPTION_TEMPLATE_ID

const STEPS = [
  { number: 1, label: 'Personal Information' },
  { number: 2, label: 'Diagnosis & Treatment' },
  { number: 3, label: 'Medication & Notes' },
  { number: 4, label: 'Confirmation' },
];

const NewPatient = () => {
  const { insertRecord, getRecords, getRecordsFromExistingPatient } = useData();
  const { authenticatedUser, userProfile } = useAuth();
  const { medicines } = useMedicine();
  const location = useLocation();
  const [studentInformation, setStudentInformation] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showAddDisease, setShowAddDisease] = useState(false);
  const [newDiseaseName, setNewDiseaseName] = useState("");
  const [isAddingDisease, setIsAddingDisease] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [patientInput, setPatientInput] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    contactNumber: "",
    yearLevel: "",
    department: "",
    sex: "",
    email: "",
    dateOfBirth: "",
    address: "",
    diseaseId: "",
    diagnosis: "",
    medication: null, // Changed from {} to null
    quantity: "",
    treatment: "",
    notes: "",
    attendingPhysician: userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : authenticatedUser?.user_metadata?.full_name,
    attendingPhysicianId: authenticatedUser?.id || null,
    physicianSignatureUrl: userProfile?.signature_url || null,
  });

  // Pre-fill patient data from navigation state (e.g., from "Create Appointment" button)
  const isReturningPatient = !!location.state?.patientData;
  const isAutoFilled = !!studentInformation;
  useEffect(() => {
    const passedData = location.state?.patientData;
    if (passedData) {
      setPatientInput((prev) => ({
        ...prev,
        studentId: passedData.studentId || '',
        firstName: passedData.firstName || '',
        lastName: passedData.lastName || '',
        email: passedData.email || '',
        contactNumber: passedData.contactNumber || '',
        yearLevel: passedData.yearLevel || '',
        department: passedData.department || '',
        sex: passedData.sex || '',
        dateOfBirth: passedData.dateOfBirth ? formatDateForInput(passedData.dateOfBirth) : '',
        address: passedData.address || '',
      }));
      setStudentInformation(passedData); // Mark as existing student
    }
  }, [location.state]);

  const formatDateForInput = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d)) return '';
      return d.toISOString().slice(0, 10);
    } catch (_e) {
      return '';
    }
  }

  const handleStudentIdBlur = async (e) => {
    const id = String(e?.target?.value || patientInput.studentId || "").trim();
    if (!id) {
      setStudentInformation(null);
      return;
    }

    try {
      const response = await getRecordsFromExistingPatient(id);
      if (!response || !response.success) {
        setStudentInformation(null);
        return;
      }

      const payload = response.data;
      const existing = Array.isArray(payload) ? payload[0] : payload;
      if (!existing) {
        setStudentInformation(null);
        return;
      }

      const confirmed = await showModal({
        title: "Patient Found",
        message: `Is this ${existing.first_name} ${existing.last_name}?`,
        type: "confirm",
        confirmLabel: "Confirm",
        cancelLabel: "No",
        showCancel: true,
      });

      if (confirmed) {
        setStudentInformation(existing);
        setPatientInput((prev) => ({
          ...prev,
          firstName: existing.first_name || prev.firstName,
          lastName: existing.last_name || prev.lastName,
          email: existing.email || prev.email,
          contactNumber: existing.contact_number || prev.contactNumber,
          yearLevel: existing.year_level || prev.yearLevel,
          department: existing.department || prev.department,
          sex: existing.sex || prev.sex,
          dateOfBirth: existing.date_of_birth ? formatDateForInput(existing.date_of_birth) : (existing.dob ? formatDateForInput(existing.dob) : prev.dateOfBirth),
          address: existing.address ?? prev.address
        }));
      }
    } catch (err) {
      console.error('Error fetching existing student info', err);
      setStudentInformation(null);
    }
  };

  useEffect(() => {
    const getAllDiseases = async () => {
      try {
        const response = await api.get("/get-all-diseases");

        if (response.data.success) {
          setDiseases(response.data.data);
        } else {
          throw new Error(`Error getting diseases: ${response.data.error}`);
        }
      } catch (err) {
        console.error(`Error fetching diseases data: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
    getAllDiseases();
  }, [])

  const handleSetPatientInput = (e) => {
    const { name, value } = e.target;

    // When student ID changes and there was previous auto-fill, clear auto-filled fields
    if (name === "studentId" && studentInformation) {
      setStudentInformation(null);
      setPatientInput((prev) => ({
        ...prev,
        studentId: value,
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "",
        yearLevel: "",
        department: "",
        sex: "",
        dateOfBirth: "",
        address: "",
      }));
      return;
    }

    if (name === "medication") {
      // If empty value, set to null instead of undefined or empty object
      if (!value || value === "") {
        setPatientInput((prev) => ({ ...prev, medication: null }));
        return;
      }
      const medjObj = medicines.find((m) => m.id === Number(value));
      // Check if medicine is out of stock
      if (medjObj && medjObj.stock_level === 0) {
        showToast({
          title: "Medicine Out of Stock",
          message: `${medjObj.medicine_name} is currently out of stock. Please select another medicine.`,
          type: "warning"
        });
        setPatientInput((prev) => ({ ...prev, medication: null }));
        return;
      }
      setPatientInput((prev) => ({ ...prev, medication: medjObj || null }));
      return;
    }

    // Diagnosis select sends the disease id; we store id in `diseaseId` and name in `diagnosis`
    if (name === "diseaseId") {
      // If empty value, clear both diseaseId and diagnosis
      if (!value || value === "") {
        setPatientInput((prev) => ({
          ...prev,
          diseaseId: "",
          diagnosis: "",
        }));
        return;
      }
      const disease = diseases.find((d) => String(d.id) === String(value));
      setPatientInput((prev) => ({
        ...prev,
        diseaseId: value,
        diagnosis: disease?.name ?? "",
      }));
      return;
    }
    setPatientInput((prev) => ({ ...prev, [name]: value }));
  }

  const handleAddDisease = async () => {
    const trimmed = newDiseaseName.trim();
    if (!trimmed) return;

    setIsAddingDisease(true);
    try {
      const response = await api.post("/add-disease", { name: trimmed });
      if (response.data.success) {
        const added = response.data.data;
        setDiseases((prev) => [...prev, added].sort((a, b) => a.name.localeCompare(b.name)));
        setPatientInput((prev) => ({
          ...prev,
          diseaseId: String(added.id),
          diagnosis: added.name,
        }));
        setNewDiseaseName("");
        setShowAddDisease(false);
        showToast({
          title: "Disease Added",
          message: `"${added.name}" has been added and selected.`,
          type: "success",
        });
      } else {
        showToast({ title: "Error", message: response.data.error, type: "error" });
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      if (err.response?.status === 409) {
        // Disease already exists — select it
        const existing = err.response.data.data;
        if (existing) {
          setPatientInput((prev) => ({
            ...prev,
            diseaseId: String(existing.id),
            diagnosis: existing.name,
          }));
          setNewDiseaseName("");
          setShowAddDisease(false);
          showToast({
            title: "Already Exists",
            message: `"${existing.name}" is already in the list and has been selected.`,
            type: "info",
          });
        }
      } else {
        showToast({ title: "Error", message: msg, type: "error" });
      }
    } finally {
      setIsAddingDisease(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const formErrors = validatePatientForm(patientInput);
      if (hasErrors(formErrors)) {
        const firstError = Object.values(formErrors).find(Boolean);
        showToast({ title: "Validation Error", message: firstError || "Please fix the highlighted errors.", type: "warning" });
        return;
      }
    }
    // Step 2 (Diagnosis & Treatment) is optional — nurse can skip for doctor to complete later
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < 4) return;
    if (isSubmitting) return;

    // Validate medication stock
    if (patientInput.medication && patientInput.quantity) {
      if (patientInput.medication.stock_level === 0) {
        showToast({
          title: "Medicine Out of Stock",
          message: `${patientInput.medication.medicine_name} is currently out of stock. Please select another medicine.`,
          type: "warning"
        });
        return;
      }
      const quantityRequested = Number(patientInput.quantity);
      if (quantityRequested > patientInput.medication.stock_level) {
        showToast({
          title: "Insufficient Stock",
          message: `Only ${patientInput.medication.stock_level} units of ${patientInput.medication.medicine_name} available. You requested ${quantityRequested} units.`,
          type: "warning"
        });
        return;
      }
    }

    setIsSubmitting(true);

    // Log what's being sent for debugging
    console.log('Submitting patientInput:', {
      ...patientInput,
      hasDiseaseId: !!patientInput.diseaseId,
      hasDiagnosis: !!patientInput.diagnosis,
      medicationType: typeof patientInput.medication,
      medicationValue: patientInput.medication
    });

    try {
      const response = await insertRecord(patientInput);
      if (!response.success) {
        const msg = response.error || 'Failed inserting record';
        const lower = String(msg).toLowerCase();
        if (lower.includes('unique') || lower.includes('duplicate') || lower.includes('already exists') || lower.includes('student_id') || lower.includes('student id')) {
          showToast({
            title: "Student Already Exist",
            message: "A patient with this Patient ID already exists. Please check the Patient ID.",
            type: "warning"
          })
        } else {
          showToast({
            title: "Something went wrong",
            message: msg,
            type: "error"
          })
        }
        return;
      } else {
        showToast({
          title: "Record Inserted Successfully",
          type: "success",
        })
        setPatientInput({
          firstName: "",
          lastName: "",
          studentId: "",
          contactNumber: "",
          yearLevel: "",
          department: "",
          sex: "",
          email: "",
          dateOfBirth: "",
          address: "",
          diseaseId: "",
          diagnosis: "",
          medication: null, // Changed from "" to null
          quantity: "",
          treatment: "",
          notes: "",
          attendingPhysician: userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : authenticatedUser?.user_metadata?.full_name,
          attendingPhysicianId: authenticatedUser?.id || null,
          physicianSignatureUrl: userProfile?.signature_url || null,
        });
        setCurrentStep(1);
        getRecords();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleClearForm = () => {
    setPatientInput({
      firstName: "",
      lastName: "",
      studentId: "",
      contactNumber: "",
      yearLevel: "",
      department: "",
      sex: "",
      email: "",
      dateOfBirth: "",
      address: "",
      diseaseId: "",
      diagnosis: "",
      medication: null,
      quantity: "",
      treatment: "",
      notes: "",
      attendingPhysician: userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : authenticatedUser?.user_metadata?.full_name,
      attendingPhysicianId: authenticatedUser?.id || null,
      physicianSignatureUrl: userProfile?.signature_url || null,
    });
    setStudentInformation(null);
    setCurrentStep(1);
  };

  return (
    <div className='h-full flex flex-col overflow-visible'>
      {isLoading ? (
        <FormSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='w-full h-full flex flex-col'
        >
          {/* ─── Page Header ─── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='flex items-center gap-4 mb-4'
          >
            <div className='w-12 h-12 rounded-xl bg-crimson-50 dark:bg-[#1F242F] flex items-center justify-center ring-1 ring-crimson-100 dark:ring-[#333741]'>
              <UserPlus className="w-6 h-6 text-crimson-600" />
            </div>
            <div className='flex-1'>
              <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Add Patient Record</h1>
              <p className='text-sm text-gray-400 dark:text-[#94969C] mt-0.5'>Register a new patient or add a visit for an existing student</p>
            </div>
          </motion.div>

          {/* ─── Stepper ─── */}
          <div className="flex items-center justify-center mb-6">
            {STEPS.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300
                      ${currentStep > step.number
                        ? 'bg-crimson-600 border-crimson-600 text-white'
                        : currentStep === step.number
                          ? 'border-crimson-600 text-crimson-600 bg-white dark:bg-[#161B26]'
                          : 'border-gray-300 dark:border-[#333741] text-gray-400 dark:text-[#94969C] bg-white dark:bg-[#161B26]'}`}
                  >
                    {currentStep > step.number ? <Check className="w-4 h-4" /> : step.number}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium whitespace-nowrap transition-colors
                      ${currentStep >= step.number ? 'text-crimson-600' : 'text-gray-400 dark:text-[#94969C]'}`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-16 md:w-28 h-0.5 mx-3 mb-5 transition-all duration-300
                      ${currentStep > step.number ? 'bg-crimson-600' : 'bg-gray-200 dark:bg-[#1F242F]'}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ─── Form Card ─── */}
          <div className='flex-1 min-h-0 flex flex-col'>
            <div className="bg-white dark:bg-[#161B26] rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] p-6 md:p-8 flex-1 min-h-0 flex flex-col">
              <form onSubmit={handleFormSubmit} className='flex-1 min-h-0 flex flex-col'>
                <AnimatePresence mode="wait">
                  {/* ══ Step 1: Personal Information ══ */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className='flex-1 flex flex-col min-h-0'
                    >
                      <p className='text-xs text-gray-400 dark:text-[#94969C] mb-4'>
                        {studentInformation ? 'Patient information is pre-filled from existing records' : 'Enter the patient ID to auto-fill existing records'}
                      </p>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4'>
                        <div className='space-y-1.5'>
                          <label htmlFor="studentID" className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Patient ID</label>
                          <input type="text" name="studentId" placeholder="Enter patient ID" id='studentID' value={patientInput.studentId} onChange={handleSetPatientInput} onBlur={handleStudentIdBlur}
                            readOnly={isReturningPatient} maxLength={LIMITS.STUDENT_ID_MAX}
                            className={`w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#94969C] outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all ${isReturningPatient ? 'bg-gray-100 dark:bg-[#1F242F] cursor-not-allowed opacity-70' : ''}`} />
                        </div>
                        <div className='space-y-1.5'>
                          <label htmlFor="firstName" className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>First Name</label>
                          <input type="text" name="firstName" placeholder="Enter first name" id='firstName' value={patientInput.firstName} onChange={handleSetPatientInput}
                            readOnly={isAutoFilled} maxLength={LIMITS.NAME_MAX}
                            className={`w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#94969C] outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all ${isAutoFilled ? 'bg-gray-100 dark:bg-[#1F242F] cursor-not-allowed opacity-70' : ''}`} />
                        </div>
                        <div className='space-y-1.5'>
                          <label htmlFor="lastName" className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Last Name</label>
                          <input type="text" name="lastName" placeholder="Enter last name" id='lastName' value={patientInput.lastName} onChange={handleSetPatientInput}
                            readOnly={isAutoFilled} maxLength={LIMITS.NAME_MAX}
                            className={`w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#94969C] outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all ${isAutoFilled ? 'bg-gray-100 dark:bg-[#1F242F] cursor-not-allowed opacity-70' : ''}`} />
                        </div>
                        <div className='space-y-1.5'>
                          <label htmlFor="contactNum" className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Contact Number</label>
                          <input type="tel" inputMode="numeric" name="contactNumber" placeholder="Enter contact number" id='contactNum' value={patientInput.contactNumber} onChange={handleSetPatientInput}
                            readOnly={isAutoFilled} maxLength={LIMITS.CONTACT_MAX}
                            className={`w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#94969C] outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all ${isAutoFilled ? 'bg-gray-100 dark:bg-[#1F242F] cursor-not-allowed opacity-70' : ''}`} />
                        </div>
                        <div className='space-y-1.5'>
                          <Dropdown
                            name="yearLevel"
                            label="Year Level"
                            placeholder="Select Year"
                            options={[
                              { label: '1st year', value: '1' },
                              { label: '2nd year', value: '2' },
                              { label: '3rd year', value: '3' },
                              { label: '4th year', value: '4' },
                            ]}
                            value={patientInput.yearLevel}
                            onChange={handleSetPatientInput}
                            disabled={isAutoFilled}
                          />
                        </div>
                        <div className='space-y-1.5'>
                          <Dropdown
                            name="department"
                            label="Department"
                            placeholder="Select Department"
                            options={[
                              { label: 'College of Science', value: 'College of Science' },
                              { label: 'College of Engineering', value: 'College of Engineering' },
                              { label: 'College of Industrial Technology', value: 'College of Industrial Technology' },
                              { label: 'College of Architecture and Fine Arts', value: 'College of Architecture and Fine Arts' },
                              { label: 'College of Industrial Education', value: 'College of Industrial Education' },
                              { label: 'College of Liberal Arts', value: 'College of Liberal Arts' },
                            ]}
                            value={patientInput.department}
                            onChange={handleSetPatientInput}
                            disabled={isAutoFilled}
                          />
                        </div>
                        <div className='space-y-1.5'>
                          <Dropdown
                            name="sex"
                            label="Sex"
                            placeholder="Select Sex"
                            options={[
                              { label: 'Male', value: 'Male' },
                              { label: 'Female', value: 'Female' },
                            ]}
                            value={patientInput.sex}
                            onChange={handleSetPatientInput}
                            disabled={isAutoFilled}
                          />
                        </div>
                        <div className='space-y-1.5'>
                          <label htmlFor="email" className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Email</label>
                          <input type="text" name="email" placeholder="Enter email address" id='email' value={patientInput.email} onChange={handleSetPatientInput}
                            readOnly={isAutoFilled} maxLength={LIMITS.EMAIL_MAX}
                            className={`w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#94969C] outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all ${isAutoFilled ? 'bg-gray-100 dark:bg-[#1F242F] cursor-not-allowed opacity-70' : ''}`} />
                        </div>
                        <div className='space-y-1.5'>
                          <label htmlFor="address" className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Address</label>
                          <input type="text" name='address' placeholder='Enter address' id='address' value={patientInput.address} onChange={handleSetPatientInput}
                            readOnly={isAutoFilled} maxLength={LIMITS.ADDRESS_MAX}
                            className={`w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#94969C] outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all ${isAutoFilled ? 'bg-gray-100 dark:bg-[#1F242F] cursor-not-allowed opacity-70' : ''}`} />
                        </div>
                        <div className='space-y-1.5'>
                          <label htmlFor="dateOfBirth" className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Date of Birth</label>
                          <input type="date" name='dateOfBirth' id='dateOfBirth' value={patientInput.dateOfBirth} onChange={handleSetPatientInput}
                            readOnly={isAutoFilled}
                            className={`w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all ${isAutoFilled ? 'bg-gray-100 dark:bg-[#1F242F] cursor-not-allowed opacity-70' : ''}`} />
                        </div>
                      </div>

                      {/* Step 1 Navigation */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-[#1F2A37]">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={handleClearForm}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-[#94969C] hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] transition-colors cursor-pointer"
                        >
                          Clear
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={handleNext}
                          className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-crimson-600 text-white text-sm font-medium tracking-wider hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer"
                        >
                          Next
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* ══ Step 2: Diagnosis & Treatment ══ */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className='flex-1 flex flex-col min-h-0'
                    >
                      <div>
                        <div className='flex items-end gap-2'>
                          <div className='flex-1'>
                            <Dropdown
                              name="diseaseId"
                              label="Diagnosis"
                              placeholder="Select Diagnosis"
                              options={diseases && diseases.length > 0 ? diseases.map((d) => ({ label: d.name, value: String(d.id) })) : []}
                              value={patientInput.diseaseId}
                              onChange={handleSetPatientInput}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowAddDisease(!showAddDisease)}
                            className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm transition-all ${showAddDisease
                              ? 'bg-gray-100 dark:bg-[#1F242F] text-gray-600 dark:text-[#94969C] ring-1 ring-gray-200 dark:ring-[#1F2A37]'
                              : 'bg-crimson-600 text-white hover:bg-crimson-700 shadow-sm'
                              }`}
                            title={showAddDisease ? 'Cancel' : 'Add new disease'}
                          >
                            {showAddDisease ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {showAddDisease && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.2 }}
                            className='flex items-center gap-2 mt-2'
                          >
                            <input
                              type="text"
                              value={newDiseaseName}
                              onChange={(e) => setNewDiseaseName(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDisease(); } }}
                              placeholder="Enter disease name..."
                              maxLength={LIMITS.DISEASE_NAME_MAX}
                              className='flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#94969C] outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all'
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={handleAddDisease}
                              disabled={!newDiseaseName.trim() || isAddingDisease}
                              className='shrink-0 px-3 py-2 rounded-xl bg-crimson-600 text-white text-sm font-medium hover:bg-crimson-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
                            >
                              {isAddingDisease ? 'Adding...' : 'Add'}
                            </button>
                          </motion.div>
                        )}
                        </div>

                      <div className='flex-1 flex flex-col mt-4'>
                        <label className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider mb-1.5 flex items-center gap-1.5'>
                          <FileText className="w-3 h-3 text-gray-400 dark:text-[#94969C]" />
                          Treatment
                        </label>
                        <textarea
                          name='treatment'
                          value={patientInput.treatment}
                          onChange={handleSetPatientInput}
                          maxLength={LIMITS.TREATMENT_MAX}
                          className='w-full flex-1 min-h-[120px] p-3 resize-none outline-none rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all placeholder:text-gray-400 dark:placeholder:text-[#94969C] dark:text-[#94969C]'
                          placeholder='Describe the treatment plan...'
                        />
                      </div>

                      {/* Step 2 Navigation */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-[#1F2A37]">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={handleBack}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-[#94969C] hover:bg-gray-100 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] transition-colors cursor-pointer"
                        >
                          Back
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={handleNext}
                          className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-crimson-600 text-white text-sm font-medium tracking-wider hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer"
                        >
                          Next
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* ══ Step 3: Medication, Quantity & Additional Notes ══ */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className='flex-1 flex flex-col min-h-0'
                    >
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                        <Dropdown
                          name="medication"
                          label="Medication"
                          placeholder="Select Medication"
                          options={medicines?.map((m) => ({ label: `${m.medicine_name}, ${m.generic_name} - ${m.stock_level} in stock`, value: String(m.id) })) || []}
                          value={String(patientInput.medication?.id || "")}
                          onChange={handleSetPatientInput}
                        />
                        <div className='space-y-1.5'>
                          <label htmlFor="quantity" className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Quantity</label>
                          <input type="number" name="quantity" placeholder="Enter quantity" id='quantity' value={patientInput.quantity} onChange={handleSetPatientInput}
                            min="0" max="9999"
                            className='w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#94969C] outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all' />
                        </div>
                      </div>

                      <div className='flex-1 flex flex-col mt-4'>
                        <label className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider mb-1.5 flex items-center gap-1.5'>
                          <StickyNote className="w-3 h-3 text-gray-400 dark:text-[#94969C]" />
                          Additional Notes
                        </label>
                        <textarea
                          name='notes'
                          value={patientInput.notes}
                          onChange={handleSetPatientInput}
                          maxLength={LIMITS.NOTES_MAX}
                          className='w-full flex-1 min-h-[120px] p-3 resize-none outline-none rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all placeholder:text-gray-400 dark:placeholder:text-[#94969C] dark:text-[#94969C]'
                          placeholder='Any additional observations or notes...'
                        />
                      </div>

                      {/* Step 3 Navigation */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-[#1F2A37]">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={handleBack}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-[#94969C] hover:bg-gray-100 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] transition-colors cursor-pointer"
                        >
                          Back
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={handleNext}
                          className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-crimson-600 text-white text-sm font-medium tracking-wider hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer"
                        >
                          Next
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* ══ Step 4: Prescription Confirmation ══ */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className='flex-1 flex flex-col min-h-0'
                    >
                      {/* Content — depends on whether diagnosis exists */}
                      {patientInput.diagnosis && patientInput.diagnosis.trim() ? (
                      /* ── Prescription Card (with diagnosis) ── */
                      <div className="flex-1 min-h-0 overflow-y-auto">
                        <div className="bg-white dark:bg-[#161B26] max-w-2xl mx-auto rounded-lg border border-gray-300 dark:border-[#333741]">
                        {/* Prescription Header */}
                        <div className="p-6 pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-5xl font-serif font-bold text-gray-800 dark:text-white leading-none">R<sub className="text-3xl">x</sub></span>
                            </div>
                            <div className="text-right text-sm text-gray-600 dark:text-[#94969C] space-y-0.5">
                              <p className="font-semibold text-gray-800 dark:text-white">{patientInput.attendingPhysician || 'N/A'}</p>
                              <p>TechClinic Health Services</p>
                              <p>Technological University of the Philippines</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-[#1F2A37] mx-6" />

                        {/* Patient Info */}
                        <div className="px-6 py-4 space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Name of Patient</span>
                              <p className="text-sm font-medium text-gray-800 dark:text-white border-b border-dotted border-gray-300 dark:border-[#333741] pb-1">
                                {patientInput.firstName} {patientInput.lastName}
                              </p>
                            </div>
                            <div className="w-28">
                              <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Sex</span>
                              <p className="text-sm font-medium text-gray-800 dark:text-white border-b border-dotted border-gray-300 dark:border-[#333741] pb-1">
                                {patientInput.sex || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Address</span>
                              <p className="text-sm font-medium text-gray-800 dark:text-white border-b border-dotted border-gray-300 dark:border-[#333741] pb-1">
                                {patientInput.address || 'N/A'}
                              </p>
                            </div>
                            <div className="w-28">
                              <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Date</span>
                              <p className="text-sm font-medium text-gray-800 dark:text-white border-b border-dotted border-gray-300 dark:border-[#333741] pb-1">
                                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Patient ID</span>
                              <p className="text-sm font-medium text-gray-800 dark:text-white border-b border-dotted border-gray-300 dark:border-[#333741] pb-1">
                                {patientInput.studentId || 'N/A'}
                              </p>
                            </div>
                            <div className="w-28">
                              <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Department</span>
                              <p className="text-sm font-medium text-gray-800 dark:text-white border-b border-dotted border-gray-300 dark:border-[#333741] pb-1 truncate" title={patientInput.department}>
                                {patientInput.department || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-[#1F2A37] mx-6" />

                        {/* Diagnosis & Treatment */}
                        <div className="px-6 py-4 space-y-3">
                          <div>
                            <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Diagnosis</span>
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                              {patientInput.diagnosis || <span className="italic text-gray-400 dark:text-[#94969C]">Pending diagnosis</span>}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Treatment</span>
                            <p className="text-sm text-gray-800 dark:text-white whitespace-pre-wrap">{patientInput.treatment || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-[#1F2A37] mx-6" />

                        {/* Drug Prescription Table */}
                        <div className="px-6 py-4">
                          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Drug Prescription</h3>
                          {patientInput.medication ? (
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-gray-200 dark:border-[#1F2A37]">
                                  <th className="text-left py-2 text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider">Medicine Name</th>
                                  <th className="text-left py-2 text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider">Generic Name</th>
                                  <th className="text-left py-2 text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider">Dosage</th>
                                  <th className="text-left py-2 text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider">Qty</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="py-2 text-gray-800 dark:text-white font-medium">{patientInput.medication.medicine_name}</td>
                                  <td className="py-2 text-gray-600 dark:text-[#94969C]">{patientInput.medication.generic_name || 'N/A'}</td>
                                  <td className="py-2 text-gray-600 dark:text-[#94969C]">{patientInput.medication.dosage || 'N/A'}</td>
                                  <td className="py-2 text-gray-600 dark:text-[#94969C]">{patientInput.quantity || 'N/A'}</td>
                                </tr>
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-sm text-gray-400 dark:text-[#94969C] italic">No medication prescribed</p>
                          )}
                        </div>

                        {/* Notes */}
                        {patientInput.notes && (
                          <>
                            <div className="border-t border-gray-200 dark:border-[#1F2A37] mx-6" />
                            <div className="px-6 py-4">
                              <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Additional Notes</span>
                              <p className="text-sm text-gray-800 dark:text-white whitespace-pre-wrap mt-1">{patientInput.notes}</p>
                            </div>
                          </>
                        )}

                        {/* Signature Area */}
                        <div className="border-t border-gray-200 dark:border-[#1F2A37] mx-6" />
                        <div className="px-6 py-5 flex justify-end">
                          <div className="text-center">
                            {userProfile?.signature_url ? (
                              <img
                                src={userProfile.signature_url}
                                alt="Physician signature"
                                className="max-h-[80px] max-w-[200px] object-contain mx-auto mb-1"
                              />
                            ) : (
                              <div className="w-48 border-b border-gray-300 dark:border-[#333741] mb-1" />
                            )}
                            <p className="text-xs text-gray-500 dark:text-[#94969C]">
                              {userProfile?.role === 'DOCTOR' ? "Attending Physician's Signature" : "Attending Personnel's Signature"}
                            </p>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-200">{patientInput.attendingPhysician || 'N/A'}</p>
                          </div>
                        </div>
                        </div>
                      </div>
                      ) : (
                      /* ── Patient Referral Summary (no diagnosis) ── */
                      <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border border-gray-300 dark:border-[#333741]">
                        <div className="bg-white dark:bg-[#161B26] max-w-2xl w-full mx-auto">
                          {/* Header */}
                          <div className="p-6 pb-4">
                            <div className="flex items-center gap-3">
                              <img src={tupLogo} alt="TUP Logo" className="w-12 h-12 object-contain" />
                              <div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Patient Referral for Diagnosis</h2>
                                <p className="text-xs text-gray-500 dark:text-[#94969C]">TechClinic Health Services &mdash; Technological University of the Philippines</p>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 dark:border-[#1F2A37] mx-6" />

                          {/* Patient Info */}
                          <div className="px-6 py-4 space-y-2">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Name of Patient</span>
                                <p className="text-sm font-medium text-gray-800 dark:text-white border-b border-dotted border-gray-300 dark:border-[#333741] pb-1">
                                  {patientInput.firstName} {patientInput.lastName}
                                </p>
                              </div>
                              <div className="w-28">
                                <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Sex</span>
                                <p className="text-sm font-medium text-gray-800 dark:text-white border-b border-dotted border-gray-300 dark:border-[#333741] pb-1">
                                  {patientInput.sex || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Patient ID</span>
                                <p className="text-sm font-medium text-gray-800 dark:text-white border-b border-dotted border-gray-300 dark:border-[#333741] pb-1">
                                  {patientInput.studentId || 'N/A'}
                                </p>
                              </div>
                              <div className="w-28">
                                <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Department</span>
                                <p className="text-sm font-medium text-gray-800 dark:text-white border-b border-dotted border-gray-300 dark:border-[#333741] pb-1 truncate" title={patientInput.department}>
                                  {patientInput.department || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Contact</span>
                                <p className="text-sm font-medium text-gray-800 dark:text-white border-b border-dotted border-gray-300 dark:border-[#333741] pb-1">
                                  {patientInput.contactNumber || 'N/A'}
                                </p>
                              </div>
                              <div className="w-28">
                                <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Date</span>
                                <p className="text-sm font-medium text-gray-800 dark:text-white border-b border-dotted border-gray-300 dark:border-[#333741] pb-1">
                                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 dark:border-[#1F2A37] mx-6" />

                          {/* Referral Notice */}
                          <div className="px-6 py-6">
                            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                                <ClipboardList className="w-4 h-4 text-amber-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-amber-800">Pending Physician Diagnosis</p>
                                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                  This patient record will be submitted without a diagnosis. A physician will be
                                  required to review and provide a formal diagnosis and treatment plan.
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Notes if any */}
                          {patientInput.notes && (
                            <>
                              <div className="border-t border-gray-200 dark:border-[#1F2A37] mx-6" />
                              <div className="px-6 py-4">
                                <span className="text-xs text-gray-400 dark:text-[#94969C] uppercase tracking-wider">Nurse Notes</span>
                                <p className="text-sm text-gray-800 dark:text-white whitespace-pre-wrap mt-1">{patientInput.notes}</p>
                              </div>
                            </>
                          )}

                          {/* Referred by */}
                          <div className="border-t border-gray-200 dark:border-[#1F2A37] mx-6" />
                          <div className="px-6 py-5 flex justify-end">
                            <div className="text-center">
                              {userProfile?.signature_url ? (
                                <img
                                  src={userProfile.signature_url}
                                  alt="Personnel signature"
                                  className="max-h-20 max-w-[200px] object-contain mx-auto mb-1"
                                />
                              ) : (
                                <div className="w-48 border-b border-gray-300 dark:border-[#333741] mb-1" />
                              )}
                              <div className="border-t border-gray-300 dark:border-[#333741] pt-1 px-4">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-200">{patientInput.attendingPhysician || 'N/A'}</p>
                                <p className="text-xs text-gray-500 dark:text-[#94969C]">Referring Personnel</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      )}

                      {/* Step 4 Navigation */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-[#1F2A37]">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={handleBack}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-[#94969C] hover:bg-gray-100 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] transition-colors cursor-pointer"
                        >
                          Back
                        </motion.button>
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            disabled={isSubmitting || isSendingEmail}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-crimson-600 text-white text-sm font-medium tracking-wider hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? <><ButtonLoader /> Submitting...</> : (
                              patientInput.diagnosis && patientInput.diagnosis.trim()
                                ? "Confirm & Insert Record"
                                : "Send for Diagnosis"
                            )}
                          </motion.button>
                          {patientInput.diagnosis && patientInput.diagnosis.trim() && patientInput.email && (
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              type="button"
                              disabled={isSubmitting || isSendingEmail}
                              onClick={async () => {
                                setIsSendingEmail(true);
                                try {
                                  const response = await insertRecord(patientInput);
                                  if (!response.success) {
                                    const msg = response.error || 'Failed inserting record';
                                    showToast({ title: "Something went wrong", message: msg, type: "error" });
                                    return;
                                  }

                                  const physicianName = patientInput.attendingPhysician || 'N/A';
                                  const templateParams = {
                                    to_email: patientInput.email.trim(),
                                    to_name: `${patientInput.firstName} ${patientInput.lastName}`.trim(),
                                    patient_id: patientInput.studentId || '\u2014',
                                    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                                    physician_name: physicianName,
                                    physician_role: userProfile?.role === 'DOCTOR' ? 'Attending Physician' : 'Attending Personnel',
                                    physician_signature: userProfile?.signature_url ?? '',
                                    diagnosis: patientInput.diagnosis ?? '\u2014',
                                    treatment: patientInput.treatment ?? '\u2014',
                                    medication: patientInput.medication?.medicine_name ?? '\u2014',
                                    dosage: patientInput.medication?.dosage ?? '\u2014',
                                    quantity: patientInput.quantity ?? '\u2014',
                                    notes: patientInput.notes ?? '\u2014',
                                  };

                                  await emailjs.send(SERVICE_ID, PRESC_TMPL, templateParams, PUBLIC_KEY);

                                  showToast({
                                    title: "Record Inserted & Email Sent",
                                    message: `Prescription sent to ${patientInput.email}`,
                                    type: "success",
                                  });

                                  setPatientInput({
                                    firstName: "", lastName: "", studentId: "", contactNumber: "",
                                    yearLevel: "", department: "", sex: "", email: "",
                                    dateOfBirth: "", address: "", diseaseId: "", diagnosis: "",
                                    medication: null, quantity: "", treatment: "", notes: "",
                                    attendingPhysician: userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : authenticatedUser?.user_metadata?.full_name,
                                    attendingPhysicianId: authenticatedUser?.id || null,
                                    physicianSignatureUrl: userProfile?.signature_url || null,
                                  });
                                  setCurrentStep(1);
                                  getRecords();
                                } catch (err) {
                                  console.error('Send & Insert error:', err);
                                  showToast({ title: "Email Failed", message: "Record may have been inserted but email failed to send.", type: "warning" });
                                } finally {
                                  setIsSendingEmail(false);
                                }
                              }}
                              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-crimson-600 text-white text-sm font-medium tracking-wider hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isSendingEmail ? <><ButtonLoader /> Sending...</> : <><Send className="w-4 h-4" /> Send & Insert Record</>}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </motion.div>
      )
      }
    </div >
  )
}

export default NewPatient