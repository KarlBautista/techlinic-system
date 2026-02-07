import React from 'react'
import Navigation from '../components/newNavigation'
import {useState} from 'react'
import useData from '../store/useDataStore'
import useAuth from '../store/useAuthStore'
import { useSearchParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useEffect } from 'react'
import useMedicine from "../store/useMedicineStore";
import axios from 'axios'
import { PageLoader, ButtonLoader } from '../components/PageLoader'

const NewPatient = () => {
  const { insertRecord, getRecords, getRecordsFromExistingPatient } = useData();
  const { authenticatedUser, userProfile } = useAuth();
  const { medicines } = useMedicine();
  const [searchParams] = useSearchParams();
  const [studentInformation, setStudentInformation] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddDisease, setShowAddDisease] = useState(false);
  const [newDiseaseName, setNewDiseaseName] = useState("");
  const [isAddingDisease, setIsAddingDisease] = useState(false);
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
  });

  // Pre-fill studentId from URL search params (e.g., from "New Visit" button)
  useEffect(() => {
    const urlStudentId = searchParams.get('studentId');
    if (urlStudentId) {
      setPatientInput((prev) => ({ ...prev, studentId: urlStudentId }));
    }
  }, [searchParams]);

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

  useEffect(() => {
    const fetchIfExists = async () => {
      const id = String(patientInput.studentId || "").trim();
      if (id.length !== 11) {
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
        setStudentInformation(existing);
        setPatientInput((prev) => ({
          ...prev,
          firstName: existing.first_name,
          lastName: existing.last_name,
          email: existing.email,
          contactNumber: existing.contact_number,
          yearLevel: existing.year_level,
          department: existing.department,
          sex: existing.sex,
          dateOfBirth: existing.date_of_birth ? formatDateForInput(existing.date_of_birth) : (existing.dob ? formatDateForInput(existing.dob) : ''),
          address: existing.address ?? ''
        }));
        Swal.fire({ 
          title: `Student: ${patientInput.studentId} Information Found.`,
          text: "The inputs have the existing data of the student now",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        })
      } catch (err) {
        console.error('Error fetching existing student info', err);
        setStudentInformation(null);
      }
    };

    fetchIfExists();
  }, [patientInput.studentId, getRecordsFromExistingPatient]);

  useEffect(() => {
    const getAllDiseases = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/get-all-diseases");

        if(response.data.success) {
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

    if(name === "medication") {
      // If empty value, set to null instead of undefined or empty object
      if (!value || value === "") {
        setPatientInput((prev) => ({...prev, medication: null}));
        return;
      }
      const medjObj = medicines.find((m) => m.id === Number(value));
      setPatientInput((prev) => ({...prev, medication: medjObj || null}));
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
      const response = await axios.post("http://localhost:3000/api/add-disease", { name: trimmed });
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
        Swal.fire({
          title: "Disease Added",
          text: `"${added.name}" has been added and selected.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({ title: "Error", text: response.data.error, icon: "error" });
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
          Swal.fire({
            title: "Already Exists",
            text: `"${existing.name}" is already in the list and has been selected.`,
            icon: "info",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      } else {
        Swal.fire({ title: "Error", text: msg, icon: "error" });
      }
    } finally {
      setIsAddingDisease(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    // Log what's being sent for debugging
    console.log('Submitting patientInput:', {
      ...patientInput,
      hasDiseaseId: !!patientInput.diseaseId,
      hasDiagnosis: !!patientInput.diagnosis,
      medicationType: typeof patientInput.medication,
      medicationValue: patientInput.medication
    });
    
    try{
      const response = await insertRecord(patientInput);
      if(!response.success){
        const msg = response.error || 'Failed inserting record';
        const lower = String(msg).toLowerCase();
        if (lower.includes('unique') || lower.includes('duplicate') || lower.includes('already exists') || lower.includes('student_id') || lower.includes('student id')) {
          Swal.fire({ 
            title: "Student Already Exist",
            text: "A patient with this Student ID already exists. Please check the Student ID.",
            showConfirmButton: true,
            icon: "warning"
          })
        } else {
          Swal.fire({
            title: "Something went wrong",
            text: msg,
            icon: "error"
          })
        }
        return;
      } else {
        Swal.fire({ 
          title: "Record Inserted Successfully",
          icon: "success",
          timer: 2000,
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
        });
        getRecords();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='h-screen w-full flex flex-col sm:flex-row'>
      <div className='h-[8%] w-full order-last sm:order-0 sm:w-[20%] sm:h-full md:w-[16%] lg:w-[14%]'>
        <Navigation />
      </div>

      <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[80%] md:w-[84%] lg:w-[86%] overflow-auto p-6 flex flex-col gap-4'>
        {isLoading ? (
          <PageLoader message="Loading patient form..." />
        ) : (
        <div className='w-full overflow-y-auto h-full flex flex-col gap-5 scrollbar'>
          {/* ─── Page Header ─── */}
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>Add Patient Record</h1>
            <p className='text-sm text-gray-500 mt-1'>Register a new patient or add a visit for an existing student</p>
          </div>

          <form onSubmit={handleFormSubmit} className='flex flex-col gap-6'>
            {/* ─── Student Information Card ─── */}
            <div className='bg-white rounded-xl shadow-sm p-6'>
              <div className='flex items-center gap-2 mb-2'>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#b01c34]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <h2 className='text-base font-semibold text-gray-800'>Student Information</h2>
              </div>
              <p className='text-xs text-gray-400 mb-4'>Enter the student ID (11 digits) to auto-fill existing records</p>

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
                  <select id="year" name="yearLevel" value={patientInput.yearLevel} onChange={handleSetPatientInput} className='w-full p-2 rounded-lg border border-gray-300 outline-none text-sm focus:border-[#b01c34] transition-colors'>
                    <option value="" disabled>Select Year</option>
                    <option value="1">1st year</option>
                    <option value="2">2nd year</option>
                    <option value="3">3rd year</option>
                    <option value="4">4th year</option>
                  </select>
                </div>

                <div className='formInfo'>
                  <select id="department" name="department" value={patientInput.department} onChange={handleSetPatientInput} className='w-full p-2 rounded-lg border border-gray-300 outline-none text-sm focus:border-[#b01c34] transition-colors'>
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
                  <select id="sex" name="sex" value={patientInput.sex} onChange={handleSetPatientInput} className='w-full p-2 rounded-lg border border-gray-300 outline-none text-sm focus:border-[#b01c34] transition-colors'>
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
            </div>

            {/* ─── Medical Information Card ─── */}
            <div className='bg-white rounded-xl shadow-sm p-6'>
              <div className='flex items-center gap-2 mb-2'>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#b01c34]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                </svg>
                <h2 className='text-base font-semibold text-gray-800'>Medical Information</h2>
              </div>
              <p className='text-xs text-gray-400 mb-4'>Diagnosis, medication, and treatment details</p>

              <div className='flex flex-col lg:flex-row gap-6'>
                {/* Left Column — Dropdowns & Quantity */}
                <div className='w-full lg:w-1/2 flex flex-col gap-0'>
                  <div className='formDiagnosis'>
                    <div className='flex flex-col gap-2'>
                      <div className='flex items-center gap-2'>
                        <select 
                          id="diseaseId" name="diseaseId" 
                          value={patientInput.diseaseId} onChange={handleSetPatientInput} 
                          className='flex-1 p-2 rounded-lg border border-gray-300 outline-none text-sm focus:border-[#b01c34] transition-colors'
                        >
                          <option value="">Select Diagnosis</option>
                          {diseases && diseases.length > 0 ? (
                            diseases.map((disease) => (
                              <option key={disease.id} value={disease.id}>{disease.name}</option>
                            ))
                          ) : null}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowAddDisease(!showAddDisease)}
                          className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-colors ${
                            showAddDisease 
                              ? 'bg-gray-200 text-gray-600' 
                              : 'bg-[#b01c34] text-white hover:bg-[#8f1629]'
                          }`}
                          title={showAddDisease ? 'Cancel' : 'Add new disease'}
                        >
                          <i className={`fa-solid ${showAddDisease ? 'fa-xmark' : 'fa-plus'} text-xs`}></i>
                        </button>
                      </div>
                      {showAddDisease && (
                        <div className='flex items-center gap-2 animate-in fade-in'>
                          <input
                            type="text"
                            value={newDiseaseName}
                            onChange={(e) => setNewDiseaseName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDisease(); } }}
                            placeholder="Enter disease name..."
                            className='flex-1 p-2 rounded-lg border border-gray-300 outline-none text-sm focus:border-[#b01c34] transition-colors'
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleAddDisease}
                            disabled={!newDiseaseName.trim() || isAddingDisease}
                            className='shrink-0 px-3 py-2 rounded-lg bg-[#b01c34] text-white text-sm font-medium hover:bg-[#8f1629] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                          >
                            {isAddingDisease ? 'Adding...' : 'Add'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='formDiagnosis'>
                    <select 
                      id="medication" name="medication" 
                      value={patientInput.medication?.id || ""} onChange={handleSetPatientInput} 
                      className='w-full p-2 rounded-lg border border-gray-300 outline-none text-sm focus:border-[#b01c34] transition-colors'
                    >
                      <option value="">Medication</option>
                      {medicines?.map((medicine) => (
                        <option key={medicine.id} value={medicine.id}>
                          {`${medicine.medicine_name}, ${medicine.generic_name} - ${medicine.stock_level} in stock`}
                        </option>
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
                    <label className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block'>Treatment</label>
                    <textarea
                      name='treatment'
                      value={patientInput.treatment}
                      onChange={handleSetPatientInput}
                      className='w-full h-28 p-3 resize-none outline-none rounded-lg border border-gray-300 text-sm focus:border-[#b01c34] transition-colors placeholder:text-gray-400'
                      placeholder='Describe the treatment plan...'
                    />
                  </div>

                  <div>
                    <label className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block'>Additional Notes</label>
                    <textarea
                      name='notes'
                      value={patientInput.notes}
                      onChange={handleSetPatientInput}
                      className='w-full h-28 p-3 resize-none outline-none rounded-lg border border-gray-300 text-sm focus:border-[#b01c34] transition-colors placeholder:text-gray-400'
                      placeholder='Any additional observations or notes...'
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className='flex justify-end mt-6 pt-4 border-t border-gray-100'>
                <button 
                  disabled={isSubmitting} 
                  className='text-white px-6 py-2.5 rounded-lg bg-[#b01c34] hover:bg-[#8f1629] transition-colors text-sm font-medium inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm'
                >
                  {isSubmitting ? <><ButtonLoader /> Submitting...</> : (
                    patientInput && patientInput.diagnosis && patientInput.diagnosis.length > 0
                      ? "Insert Record"
                      : "Send for Diagnosis"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
        )}
      </div>
    </div>
  )
}

export default NewPatient