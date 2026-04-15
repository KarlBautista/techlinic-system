import React, { useState, useEffect } from 'react'
import useData from '../store/useDataStore'
import useAuth from '../store/useAuthStore'
import { showToast } from '../components/Toast'
import useMedicine from "../store/useMedicineStore";
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import emailjs from '@emailjs/browser'
import { FormSkeleton, ButtonLoader } from '../components/PageLoader'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, Plus, X, FileText, StickyNote, Check, Send, Stethoscope, Pill } from 'lucide-react'
import Dropdown from '../components/Dropdown'
import { LIMITS } from '../lib/validation'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const PRESC_TMPL = import.meta.env.VITE_EMAILJS_PRESCRIPTION_TEMPLATE_ID;

const STEPS = [
  { number: 1, label: 'Patient Info' },
  { number: 2, label: 'Diagnosis' },
  { number: 3, label: 'Prescription' },
  { number: 4, label: 'Confirmation' },
];

const AddDiagnosis = () => {
  const { getRecords } = useData();
  const { authenticatedUser, userProfile } = useAuth();
  const { medicines, updateMedicine, getMedicines } = useMedicine();
  const { recordId } = useParams();
  const navigate = useNavigate();

  const [patientData, setPatientData] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showAddDisease, setShowAddDisease] = useState(false);
  const [newDiseaseName, setNewDiseaseName] = useState("");
  const [isAddingDisease, setIsAddingDisease] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [patientInput, setPatientInput] = useState({
    id: "",
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

  const formatDateForInput = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d)) return '';
      return d.toISOString().slice(0, 10);
    } catch (_e) {
      return '';
    }
  };

  useEffect(() => {
    setPatientInput((prev) => ({
      ...prev,
      id: patientData[0]?.id,
      firstName: patientData[0]?.first_name,
      lastName: patientData[0]?.last_name,
      studentId: patientData[0]?.student_id,
      contactNumber: patientData[0]?.contact_number,
      yearLevel: patientData[0]?.year_level,
      department: patientData[0]?.department,
      sex: patientData[0]?.sex,
      email: patientData[0]?.email,
      dateOfBirth: formatDateForInput(patientData[0]?.date_of_birth),
      address: patientData[0]?.address,
      temperature: patientData[0]?.temperature,
      bloodPressure: patientData[0]?.blood_pressure,
      height: patientData[0]?.height,
      weight: patientData[0]?.weight,
    }));
  }, [patientData]);

  useEffect(() => {
    const getRecord = async () => {
      try {
        const response = await api.get(`/get-record-to-diagnose/${recordId}`);
        if (response.status === 200) {
          setPatientData(response.data.data);
        }
      } catch (err) {
        console.error(`Something went wrong getting record: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    getRecord();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const getAllDiseases = async () => {
      try {
        const response = await api.get("/get-all-diseases");
        if (response.data.success) {
          setDiseases(response.data.data);
        }
      } catch (err) {
        console.error(`Error fetching diseases data: ${err.message}`);
      }
    };
    getAllDiseases();
  }, []);

  const handleSetPatientInput = (e) => {
    const { name, value } = e.target;
    if (name === "medication") {
      const medjObj = medicines.find((m) => m.id === Number(value));
      if (medjObj && medjObj.stock_level === 0) {
        showToast({ title: "Medicine Out of Stock", message: `${medjObj.medicine_name} is currently out of stock.`, type: "warning" });
        setPatientInput((prev) => ({ ...prev, medication: null, quantity: "" }));
        return;
      }
      setPatientInput((prev) => ({ ...prev, medication: medjObj }));
      return;
    }
    if (name === "diseaseId") {
      const disease = diseases.find((d) => String(d.id) === String(value));
      setPatientInput((prev) => ({ ...prev, diseaseId: value, diagnosis: disease?.name ?? "" }));
      return;
    }
    setPatientInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDisease = async () => {
    const trimmed = newDiseaseName.trim();
    if (!trimmed) return;
    setIsAddingDisease(true);
    try {
      const response = await api.post("/add-disease", { name: trimmed });
      if (response.data.success) {
        const added = response.data.data;
        setDiseases((prev) => [...prev, added].sort((a, b) => a.name.localeCompare(b.name)));
        setPatientInput((prev) => ({ ...prev, diseaseId: String(added.id), diagnosis: added.name }));
        setNewDiseaseName("");
        setShowAddDisease(false);
        showToast({ title: "Disease Added", message: `"${added.name}" has been added and selected.`, type: "success" });
      } else {
        showToast({ title: "Error", message: response.data.error, type: "error" });
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      if (err.response?.status === 409) {
        const existing = err.response.data.data;
        if (existing) {
          setPatientInput((prev) => ({ ...prev, diseaseId: String(existing.id), diagnosis: existing.name }));
          setNewDiseaseName("");
          setShowAddDisease(false);
          showToast({ title: "Already Exists", message: `"${existing.name}" is already in the list and has been selected.`, type: "info" });
        }
      } else {
        showToast({ title: "Error", message: msg, type: "error" });
      }
    } finally {
      setIsAddingDisease(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      if (!patientInput.diseaseId || !patientInput.diagnosis?.trim()) {
        showToast({ title: "Incomplete", message: "Please select a diagnosis before proceeding.", type: "warning" });
        return;
      }
      if (!patientInput.treatment?.trim()) {
        showToast({ title: "Incomplete", message: "Please fill out the treatment field.", type: "warning" });
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const insertDiagnosis = async () => {
    if (patientInput.medication?.id && patientInput.quantity) {
      if (patientInput.medication.stock_level === 0) {
        showToast({ title: "Medicine Out of Stock", message: `${patientInput.medication.medicine_name} is out of stock.`, type: "error" });
        return false;
      }
      const qty = parseInt(patientInput.quantity, 10);
      if (qty > patientInput.medication.stock_level) {
        showToast({ title: "Insufficient Stock", message: `Only ${patientInput.medication.stock_level} units available.`, type: "warning" });
        return false;
      }
    }

    const response = await api.put("/insert-diagnosis", { patientInput });
    if (response.status !== 200) {
      showToast({ title: "Something went wrong inserting diagnosis", type: "error" });
      return false;
    }

    if (patientInput.medication?.id && patientInput.quantity) {
      const quantityUsed = parseInt(patientInput.quantity, 10);
      const newStockLevel = Math.max(0, patientInput.medication.stock_level - quantityUsed);
      try {
        await updateMedicine({ ...patientInput.medication, stock_level: newStockLevel });
        await getMedicines();
      } catch (err) {
        console.error('Error updating medicine:', err);
      }
    }

    await getRecords(true);
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < 4) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const success = await insertDiagnosis();
      if (success) {
        showToast({ title: "Diagnosis Successfully Inserted", type: "success" });
        navigate(`/individual-record/${patientInput.studentId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='h-full flex flex-col overflow-hidden'>
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
              <Stethoscope className="w-6 h-6 text-crimson-600" />
            </div>
            <div className='flex-1'>
              <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Add Patient Diagnosis</h1>
              <p className='text-sm text-gray-400 dark:text-[#94969C] mt-0.5'>
                {patientInput.firstName ? `${patientInput.firstName} ${patientInput.lastName}` : 'Patient clinical documentation'}
              </p>
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
              <form onSubmit={handleFormSubmit} className='flex-1 min-h-0 flex flex-col overflow-hidden'>
                <AnimatePresence mode="wait">
              {/* ══ Step 1: Patient Info (read-only) ══ */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className='flex-1 flex flex-col overflow-y-auto'
                >
                  <p className='text-xs text-gray-400 dark:text-[#94969C] mb-4'>Details from the nurse's intake record</p>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4'>
                    {[
                      { label: 'Patient ID', value: patientInput.studentId },
                      { label: 'First Name', value: patientInput.firstName },
                      { label: 'Last Name', value: patientInput.lastName },
                      { label: 'Contact Number', value: patientInput.contactNumber },
                      { label: 'Year Level', value: patientInput.yearLevel ? `${patientInput.yearLevel}${['st','nd','rd'][patientInput.yearLevel-1]||'th'} Year` : '' },
                      { label: 'Department', value: patientInput.department },
                      { label: 'Sex', value: patientInput.sex },
                      { label: 'Email', value: patientInput.email },
                      { label: 'Address', value: patientInput.address },
                      { label: 'Date of Birth', value: patientInput.dateOfBirth },
                    ].map((field) => (
                      <div key={field.label} className='space-y-1.5'>
                        <label className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>{field.label}</label>
                        <div className='w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-[#1F242F]'>
                          {field.value || <span className='text-gray-400 dark:text-[#94969C]'>N/A</span>}
                        </div>
                      </div>
                    ))}

                    {/* ── Vitals ── */}
                    <div className='md:col-span-2 mt-2 mb-1'>
                      <p className='text-xs font-semibold text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Vitals</p>
                    </div>
                    <div className='space-y-1.5'>
                      <label htmlFor="temperature" className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Temperature (°C)</label>
                      <input type="number" step="0.1" name="temperature" placeholder="e.g. 36.5" id='temperature' value={patientInput.temperature || ''} onChange={handleSetPatientInput}
                        className='w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#94969C] outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all' />
                    </div>
                    <div className='space-y-1.5'>
                      <label htmlFor="bloodPressure" className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Blood Pressure</label>
                      <input type="text" name="bloodPressure" placeholder="e.g. 120/80" id='bloodPressure' value={patientInput.bloodPressure || ''} onChange={handleSetPatientInput}
                        maxLength={10}
                        className='w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#94969C] outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all' />
                    </div>
                    <div className='space-y-1.5'>
                      <label htmlFor="height" className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Height (cm)</label>
                      <input type="number" step="0.1" name="height" placeholder="e.g. 170" id='height' value={patientInput.height || ''} onChange={handleSetPatientInput}
                        className='w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#94969C] outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all' />
                    </div>
                    <div className='space-y-1.5'>
                      <label htmlFor="weight" className='text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider'>Weight (kg)</label>
                      <input type="number" step="0.1" name="weight" placeholder="e.g. 65" id='weight' value={patientInput.weight || ''} onChange={handleSetPatientInput}
                        className='w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#94969C] outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all' />
                    </div>
                  </div>

                  {/* Step 1 Navigation */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-[#1F2A37]">
                    <div />
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
                  className='flex-1 flex flex-col gap-5'
                >
                  <div>
                    <div className='flex items-end gap-2'>
                      <div className='flex-1'>
                        <Dropdown
                          name="diseaseId"
                          label="Diagnosis"
                          placeholder="Select Diagnosis"
                          options={diseases?.length > 0 ? diseases.map((d) => ({ label: d.name, value: String(d.id) })) : []}
                          value={patientInput.diseaseId}
                          onChange={handleSetPatientInput}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddDisease(!showAddDisease)}
                        className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm transition-all ${showAddDisease
                          ? 'bg-gray-100 dark:bg-[#1F242F] text-gray-600 dark:text-[#94969C] ring-1 ring-gray-200 dark:ring-[#1F2A37]'
                          : 'bg-crimson-600 text-white hover:bg-crimson-700 shadow-sm'}`}
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
                          onChange={(e) => {
                            const val = e.target.value;
                            setNewDiseaseName(val.charAt(0).toUpperCase() + val.slice(1));
                          }}
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

                  <div className='flex-1 flex flex-col'>
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
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100 dark:border-[#1F2A37]">
                    <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={handleBack}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-[#94969C] hover:bg-gray-100 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] transition-colors cursor-pointer">
                      Back
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={handleNext}
                      className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-crimson-600 text-white text-sm font-medium tracking-wider hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer">
                      Next
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ══ Step 3: Prescription (Medication, Quantity & Notes) ══ */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className='flex-1 flex flex-col gap-5'
                >
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                    <Dropdown
                      name="medication"
                      label="Medication"
                      placeholder="Select Medication"
                      options={medicines?.map((m) => ({
                        label: `${m.medicine_name}, ${m.generic_name} - ${m.stock_level} in stock`,
                        value: String(m.id)
                      })) || []}
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

                  <div className='flex-1 flex flex-col'>
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
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100 dark:border-[#1F2A37]">
                    <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={handleBack}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-[#94969C] hover:bg-gray-100 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] transition-colors cursor-pointer">
                      Back
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={handleNext}
                      className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl bg-crimson-600 text-white text-sm font-medium tracking-wider hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer">
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
                  {/* Prescription Card — scrollable */}
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
                          <p className="text-sm font-medium text-gray-800 dark:text-white">{patientInput.diagnosis || 'N/A'}</p>
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
                              className="max-h-20 max-w-[200px] object-contain mx-auto mb-1"
                            />
                          ) : (
                            <div className="w-48 border-b border-gray-300 dark:border-[#333741] mb-1" />
                          )}
                          <p className="text-xs text-gray-500 dark:text-[#94969C]">Attending Physician&apos;s Signature</p>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-200">{patientInput.attendingPhysician || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 Navigation */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-[#1F2A37]">
                    <motion.button whileTap={{ scale: 0.97 }} type="button" onClick={handleBack}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-[#94969C] hover:bg-gray-100 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] transition-colors cursor-pointer">
                      Back
                    </motion.button>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={isSubmitting || isSendingEmail}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-crimson-600 text-white text-sm font-medium tracking-wider hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? <><ButtonLoader /> Submitting...</> : "Confirm & Insert Diagnosis"}
                      </motion.button>
                      {patientInput.email && (
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          disabled={isSubmitting || isSendingEmail}
                          onClick={async () => {
                            setIsSendingEmail(true);
                            try {
                              const success = await insertDiagnosis();
                              if (!success) return;

                              const templateParams = {
                                to_email: patientInput.email.trim(),
                                to_name: `${patientInput.firstName} ${patientInput.lastName}`.trim(),
                                patient_id: patientInput.studentId || '\u2014',
                                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                                physician_name: patientInput.attendingPhysician || 'N/A',
                                physician_role: 'Attending Physician',
                                physician_signature: userProfile?.signature_url ?? '',
                                diagnosis: patientInput.diagnosis ?? '\u2014',
                                treatment: patientInput.treatment ?? '\u2014',
                                medication: patientInput.medication?.medicine_name ?? '\u2014',
                                dosage: patientInput.medication?.dosage ?? '\u2014',
                                quantity: patientInput.quantity ?? '\u2014',
                                notes: patientInput.notes ?? '\u2014',
                              };

                              await emailjs.send(SERVICE_ID, PRESC_TMPL, templateParams, PUBLIC_KEY);
                              showToast({ title: "Diagnosis Inserted & Email Sent", message: `Prescription sent to ${patientInput.email}`, type: "success" });
                              navigate(`/individual-record/${patientInput.studentId}`);
                            } catch (err) {
                              console.error('Send & Insert error:', err);
                              showToast({ title: "Email Failed", message: "Diagnosis may have been inserted but email failed.", type: "warning" });
                            } finally {
                              setIsSendingEmail(false);
                            }
                          }}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-crimson-600 text-white text-sm font-medium tracking-wider hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isSendingEmail ? <><ButtonLoader /> Sending...</> : <><Send className="w-4 h-4" /> Send & Insert Diagnosis</>}
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
      )}
    </div>
  );
};

export default AddDiagnosis;
