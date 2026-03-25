import React from 'react'
import { useState } from 'react'
import useData from '../store/useDataStore'
import useAuth from '../store/useAuthStore'
import { showToast } from '../components/Toast'
import { showModal } from '../components/Modal'
import { useEffect } from 'react'
import useMedicine from "../store/useMedicineStore";
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { FormSkeleton, ButtonLoader } from '../components/PageLoader'
import { motion } from 'framer-motion'
import { UserPlus, ClipboardList, Plus, X, FileText, StickyNote } from 'lucide-react'
const AddDiagnosis = () => {
  const { insertRecord, getRecords, getRecordsFromExistingPatient } = useData();
  const { authenticatedUser, userProfile } = useAuth();
  const { medicines, updateMedicine, getMedicines } = useMedicine();
  const { recordId } = useParams();
  const [patientData, setPatientData] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddDisease, setShowAddDisease] = useState(false);
  const [newDiseaseName, setNewDiseaseName] = useState("");
  const [isAddingDisease, setIsAddingDisease] = useState(false);
  const navigate = useNavigate();
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
    medication: {},
    quantity: "",
    treatment: "",
    notes: "",
    attendingPhysician: userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : authenticatedUser?.user_metadata?.full_name,
    attendingPhysicianId: authenticatedUser?.id || null,
  });


  const formatDateForInput = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d)) return '';
      return d.toISOString().slice(0, 10);
    } catch (e) {
      return '';
    }
  }


  console.log("ito patient data", patientData)

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
    }))
  }, [patientData])

  useEffect(() => {
    const getRecord = async () => {
      try {
        const response = await api.get(`/get-record-to-diagnose/${recordId}`);
        if (response.status === 200) {

          setPatientData(response.data.data);
        } else {
          console.error(`Error getting record: ${response.data.error}`);
          return
        }
      } catch (err) {
        console.error(`Something went wrong getting record: ${err.message}`);
        return
      } finally {
        setIsLoading(false);
      }
    }
    getRecord();
  }, [])


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
      }

    }
    getAllDiseases();
  }, [])






  const handleSetPatientInput = (e) => {
    const { name, value } = e.target;

    if (name === "medication") {
      const medjObj = medicines.find((m) => m.id === Number(value));

      // Check if medicine is out of stock
      if (medjObj && medjObj.stock_level === 0) {
        showToast({
          title: "Medicine Out of Stock",
          message: `${medjObj.medicine_name} is currently out of stock. Please select another medicine.`,
          type: "warning",
        });
        // Clear the medication selection
        setPatientInput((prev) => ({ ...prev, medication: {}, quantity: "" }));
        return;
      }

      setPatientInput((prev) => ({ ...prev, medication: medjObj }));
      return;
    }

    // Diagnosis select sends the disease id; we store id in `diseaseId` and name in `diagnosis`
    if (name === "diseaseId") {
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


  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Validate if trying to prescribe out-of-stock medicine
    if (patientInput.medication && patientInput.medication.id && patientInput.quantity) {
      if (patientInput.medication.stock_level === 0) {
        showToast({
          title: "Medicine Out of Stock",
          message: `${patientInput.medication.medicine_name} is out of stock. Cannot prescribe this medicine.`,
          type: "error",
        });
        return;
      }

      // Check if quantity exceeds available stock
      const quantityRequested = parseInt(patientInput.quantity, 10);
      if (quantityRequested > patientInput.medication.stock_level) {
        showToast({
          title: "Insufficient Stock",
          message: `Only ${patientInput.medication.stock_level} units of ${patientInput.medication.medicine_name} available. You requested ${quantityRequested} units.`,
          type: "warning",
        });
        return;
      }
    }

    try {
      const response = await api.put("/insert-diagnosis", {
        patientInput
      });
      if (response.status === 200) {
        // Update medicine inventory if medication and quantity are provided
        if (patientInput.medication && patientInput.medication.id && patientInput.quantity) {
          const quantityUsed = parseInt(patientInput.quantity, 10);
          const newStockLevel = Math.max(0, patientInput.medication.stock_level - quantityUsed);

          const updatedMedicine = {
            ...patientInput.medication,
            stock_level: newStockLevel
          };

          console.log('Updating medicine with:', {
            medicineId: updatedMedicine.id,
            oldStock: patientInput.medication.stock_level,
            quantityUsed,
            newStock: newStockLevel
          });

          try {
            const updateResponse = await updateMedicine(updatedMedicine);
            console.log('Medicine update response:', updateResponse);

            // Always refresh medicines regardless of response
            await getMedicines();
            console.log('Medicines refreshed after update');
          } catch (err) {
            console.error('Error updating medicine:', err);
          }
        }

        showToast({
          title: "Diagnosis Successfully Inserted",
          type: "success",
        });
        navigate(`/individual-record/${patientInput.studentId}`);



      } else {
        showToast({
          title: "Something went wrong inserting diagnosis",
          type: "error",
        })
      }
      getRecords();
    }
    catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
      <div className='flex flex-col gap-4'>
        {isLoading ? (
          <FormSkeleton />
        ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='w-full overflow-y-auto h-full flex flex-col gap-5 scrollbar'
        >
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className='text-2xl font-bold text-gray-800'>Add Patient Diagnosis</h1>
            <p className='text-sm text-gray-500 mt-1'>Patient clinical documentation</p>
          </motion.div>

          <form onSubmit={handleFormSubmit} className='flex flex-col gap-6'>
            {/* ─── Student Information Card ─── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className='bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6'
            >
              <div className='flex items-center gap-2.5 mb-2'>
                <div className='w-8 h-8 rounded-lg bg-crimson-50 flex items-center justify-center'>
                  <UserPlus className="w-4 h-4 text-crimson-600" />
                </div>
                <h2 className='text-base font-semibold text-gray-800'>Student Information</h2>
              </div>
              <p className='text-xs text-gray-400 mb-5 ml-[42px]'>Patient details from the intake record</p>

              <div className='flex flex-wrap gap-x-[5%] gap-y-0'>
                <div className='formInfo'>
                  <input type="text" name="studentId" placeholder=" " id='studentID' value={patientInput.studentId} onChange={handleSetPatientInput} />
                  <label htmlFor="studentID" className='text-[.8rem]'>Student ID</label>
                </div>
                <div className='formInfo'>
                  <input type="text" name="firstName" placeholder=" " id='firstName' value={patientInput.firstName} onChange={handleSetPatientInput} />
                  <label htmlFor="firstName" className='text-[.8rem]'>First name</label>
                </div>
                <div className='formInfo'>
                  <input type="text" name="lastName" placeholder=" " id='lastName' value={patientInput.lastName} onChange={handleSetPatientInput} />
                  <label htmlFor="lastName" className='text-[.8rem]'>Last name</label>
                </div>
                <div className='formInfo'>
                  <input type="tel" inputMode="numeric" name="contactNumber" placeholder=" " id='contactNum' value={patientInput.contactNumber} onChange={handleSetPatientInput} />
                  <label htmlFor="contactNum" className='text-[.8rem]'>Contact Number</label>
                </div>
                <div className='formInfo'>
                  <select id="year" name="yearLevel" value={patientInput.yearLevel} onChange={handleSetPatientInput} className='w-full p-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all'>
                    <option value="" disabled>Select Year</option>
                    <option value="1">1st year</option>
                    <option value="2">2nd year</option>
                    <option value="3">3rd year</option>
                    <option value="4">4th year</option>
                  </select>
                </div>
                <div className='formInfo'>
                  <select id="department" name="department" value={patientInput.department} onChange={handleSetPatientInput} className='w-full p-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all'>
                    <option value="" disabled>Select Department</option>
                    <option value="College of Science">College of Science</option>
                    <option value="College of Engineering">College of Engineering</option>
                    <option value="College of Industrial Technology">College of Industrial Technology</option>
                    <option value="College of Architecture and Fine Arts">College of Architecture and Fine Arts</option>
                    <option value="College of Industrial Education">College of Industrial Education</option>
                    <option value="College of Liberal Arts">College of Liberal Arts</option>
                  </select>
                </div>
                <div className='formInfo'>
                  <select id="sex" name="sex" value={patientInput.sex} onChange={handleSetPatientInput} className='w-full p-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all'>
                    <option value="" disabled>Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className='formInfo'>
                  <input type="text" name="email" placeholder=" " id='email' value={patientInput.email} onChange={handleSetPatientInput} />
                  <label htmlFor="email" className='text-[.8rem]'>Email</label>
                </div>
                <div className='formInfo'>
                  <input type="text" name='address' placeholder=' ' id='address' value={patientInput.address} onChange={handleSetPatientInput} />
                  <label htmlFor="address" className='text-[.8rem]'>Address</label>
                </div>
                <div className='formInfo'>
                  <input type="date" name='dateOfBirth' placeholder='' id='dateOfBirth' value={patientInput.dateOfBirth} onChange={handleSetPatientInput} />
                  <label htmlFor="dateOfBirth" className='text-[.8rem]'>Date of Birth</label>
                </div>
              </div>
            </motion.div>

            {/* ─── Medical Information Card ─── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.35 }}
              className='bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6'
            >
              <div className='flex items-center gap-2.5 mb-2'>
                <div className='w-8 h-8 rounded-lg bg-crimson-50 flex items-center justify-center'>
                  <ClipboardList className="w-4 h-4 text-crimson-600" />
                </div>
                <h2 className='text-base font-semibold text-gray-800'>Medical Information</h2>
              </div>
              <p className='text-xs text-gray-400 mb-5 ml-[42px]'>Diagnosis, medication, and treatment details</p>

              <div className='flex flex-col lg:flex-row gap-6'>
                {/* Left Column — Dropdowns & Quantity */}
                <div className='w-full lg:w-1/2 flex flex-col gap-0'>
                  <div className='formDiagnosis'>
                    <div className='flex flex-col gap-2'>
                      <div className='flex items-center gap-2'>
                        <select id="diseaseId" name="diseaseId" value={patientInput.diseaseId} onChange={handleSetPatientInput} className='flex-1 p-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all'>
                          <option value="" disabled>Select Diagnosis</option>
                          {diseases && diseases.length > 0 ? (
                            diseases.map((disease) => <option key={disease.id} value={disease.id}>{disease.name}</option>)
                          ) : null}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowAddDisease(!showAddDisease)}
                          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all ${
                            showAddDisease 
                              ? 'bg-gray-100 text-gray-600 ring-1 ring-gray-200' 
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
                          className='flex items-center gap-2'
                        >
                          <input
                            type="text"
                            value={newDiseaseName}
                            onChange={(e) => setNewDiseaseName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDisease(); } }}
                            placeholder="Enter disease name..."
                            className='flex-1 p-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all'
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
                  </div>

                  <div className='formDiagnosis'>
                    <select id="medication" name="medication" value={patientInput.medication?.id || ""} onChange={handleSetPatientInput} className='w-full p-2 rounded-xl border border-gray-200 outline-none text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all'>
                      <option value="" disabled>Medication</option>
                      {medicines?.map((medicine) => (
                        <option key={medicine.id} value={medicine.id}>{`${medicine.medicine_name}, ${medicine.generic_name} - ${medicine.stock_level} in stock`}</option>
                      ))}
                    </select>
                  </div>

                  <div className='formDiagnosis'>
                    <input type="number" name="quantity" placeholder=" " id='quantity' value={patientInput.quantity} onChange={handleSetPatientInput} />
                    <label htmlFor="quantity" className='text-[.8rem]'>Quantity</label>
                  </div>
                </div>

                {/* Right Column — Textareas */}
                <div className='w-full lg:w-1/2 flex flex-col gap-4'>
                  <div>
                    <label className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5'>
                      <FileText className="w-3 h-3 text-gray-400" />
                      Treatment
                    </label>
                    <textarea
                      name='treatment'
                      value={patientInput.treatment}
                      onChange={handleSetPatientInput}
                      className='w-full h-28 p-3 resize-none outline-none rounded-xl border border-gray-200 text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all placeholder:text-gray-400'
                      placeholder='Describe the treatment plan...'
                    />
                  </div>

                  <div>
                    <label className='text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5'>
                      <StickyNote className="w-3 h-3 text-gray-400" />
                      Additional Notes
                    </label>
                    <textarea
                      name='notes'
                      value={patientInput.notes}
                      onChange={handleSetPatientInput}
                      className='w-full h-28 p-3 resize-none outline-none rounded-xl border border-gray-200 text-sm focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all placeholder:text-gray-400'
                      placeholder='Any additional observations or notes...'
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className='flex justify-end mt-6 pt-4 border-t border-gray-100'>
                <button 
                  disabled={isSubmitting} 
                  className='text-white px-6 py-2.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 transition-colors text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm'
                >
                  {isSubmitting ? <><ButtonLoader /> Submitting...</> : 'Insert Diagnosis'}
                </button>
              </div>
            </motion.div>
          </form>
        </motion.div>
        )}
      </div>
  )
}

export default AddDiagnosis
