import React from 'react'
import Navigation from '../components/newNavigation'
import {useState} from 'react'
import useData from '../store/useDataStore'
import useAuth from '../store/useAuthStore'
import Swal from 'sweetalert2'
import { useEffect } from 'react'
import useMedicine from "../store/useMedicineStore";
import axios from 'axios'
import { PageLoader, ButtonLoader } from '../components/PageLoader'

const NewPatient = () => {
  const { insertRecord, getRecords, getRecordsFromExistingPatient } = useData();
  const { authenticatedUser } = useAuth();
  const { medicines } = useMedicine();
  const [studentInformation, setStudentInformation] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    attendingPhysician: authenticatedUser?.user_metadata?.full_name,
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
          attendingPhysician: authenticatedUser?.user_metadata?.full_name,
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
      <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%]'>
        <Navigation />
      </div>

      <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-6 flex flex-col gap-4'>
        {isLoading ? (
          <PageLoader message="Loading patient form..." />
        ) : (
        <div className='w-full overflow-y-scroll h-full flex flex-col items-center gap-5 scrollbar'>
          <div className='w-full flex flex-col gap-2'>
            <h1 className='text-2xl font-bold text-gray-800'>Add Patient Record</h1>
            <p className='text-sm text-gray-500 mt-1'>Patient clinical documentation</p>
          </div>

          <div className='w-[90%] flex flex-col items-center'>
            <div className='w-full'>
              <p className='text-[1rem] text-gray-800'>Student Information</p>
            </div>
            <div className='border border-gray-200 w-full'></div>

            <form onSubmit={handleFormSubmit} className=' w-full  flex flex-wrap gap-2 justify-evenly mt-2'>
              <div className='formInfo'>
                <input
                  type="text"
                  name="studentId"
                  placeholder=" "
                  id='studentID'
                  value={patientInput.studentId}
                  onChange={handleSetPatientInput}
                />
                <label htmlFor="studentID" className='text-[.8rem]'>Student ID</label>
              </div>
              
              <div className='formInfo'>
                <input
                  type="text"
                  name="firstName"
                  placeholder=" "
                  id='firstName'
                  value={patientInput.firstName}
                  onChange={handleSetPatientInput}
                />
                <label htmlFor="firstName" className='text-[.8rem]'>First name</label>
              </div>

              <div className='formInfo'>
                <input
                  type="text"
                  name="lastName"
                  placeholder=" "
                  id='lastName'
                  value={patientInput.lastName}
                  onChange={handleSetPatientInput}
                />
                <label htmlFor="lastName" className='text-[.8rem]'>Last name</label>
              </div>

              <div className='formInfo'>
                <input
                  type="tel"
                  inputMode="numeric"
                  name="contactNumber"
                  placeholder=" "
                  id='contactNum'
                  value={patientInput.contactNumber}
                  onChange={handleSetPatientInput}
                />
                <label htmlFor="contactNum" className='text-[.8rem]'>Contact Number</label>
              </div>

              <div className='formInfo'>
                <select id="year" name="yearLevel" value={patientInput.yearLevel} onChange={handleSetPatientInput} className='w-full p-2 rounded-[10px] border outline-none'>
                  <option value="" disabled>Select Year</option>
                  <option value="1">1st year</option>
                  <option value="2">2nd year</option>
                  <option value="3">3rd year</option>
                  <option value="4">4th year</option>
                </select>
              </div>

              <div className='formInfo'>
                <select id="department" name="department" value={patientInput.department} onChange={handleSetPatientInput} className='w-full p-2 rounded-[10px] border outline-none'>
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
                <select id="sex" name="sex" value={patientInput.sex} onChange={handleSetPatientInput} className='w-full p-2 rounded-[10px] border outline-none'>
                  <option value="" disabled>Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              
              <div className='formInfo'>
                <input
                  type="text"
                  name="email"
                  placeholder=" "
                  id='email'
                  value={patientInput.email}
                  onChange={handleSetPatientInput}
                />
                <label htmlFor="email" className='text-[.8rem]'>Email</label>
              </div>

              <div className='formInfo'>
                <input 
                  type="text"
                  name='address'
                  placeholder=' '
                  id='address'
                  value={patientInput.address}
                  onChange={handleSetPatientInput} 
                />
                <label htmlFor="address" className='text-[.8rem]'>Address</label>
              </div>

              <div className='formInfo'>
                <input 
                  type="date"
                  name='dateOfBirth'
                  placeholder=''
                  id='dateOfBirth'
                  value={patientInput.dateOfBirth}
                  onChange={handleSetPatientInput} 
                />
                <label htmlFor="dateOfBirth" className='text-[.8rem]'>Date of Birth</label>
              </div>
              
              <div className='w-full mt-10'>
                <p className='text-[1rem]'>Medical Information</p>
              </div>
              <div className='border border-gray-200 w-full'></div>
              
              <div className='w-full h-[400px] flex'>
                <div className='w-[50%] h-full flex items-center flex-col '>
                  <div className='formDiagnosis'>
                    <select 
                      id="diseaseId" 
                      name="diseaseId" 
                      value={patientInput.diseaseId} 
                      onChange={handleSetPatientInput} 
                      className='w-full p-2 rounded-[10px] border outline-none'
                    >
                      <option value="">Select Diagnosis</option>
                      {diseases && diseases.length > 0 ? (
                        diseases.map((disease) => (
                          <option key={disease.id} value={disease.id}>
                            {disease.name}
                          </option>
                        ))
                      ) : null}
                    </select>
                  </div>

                  <div className='formDiagnosis'>
                    <select 
                      id="medication" 
                      name="medication" 
                      value={patientInput.medication?.id || ""} 
                      onChange={handleSetPatientInput} 
                      className='w-full p-2 rounded-[10px] border outline-none'
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
                    <input
                      type="number"
                      name="quantity"
                      placeholder=" "
                      id='quantity'
                      value={patientInput.quantity}
                      onChange={handleSetPatientInput}
                    />
                    <label htmlFor="quantity" className='text-[.8rem]'>Quantity</label>
                  </div>
                  
                  <div className='w-full h-[50%]  flex justify-center items-center'>
                    <button disabled={isSubmitting} className='text-white px-5 py-3 rounded-lg bg-[#ef4444] inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'>
                      {isSubmitting ? <><ButtonLoader /> Submitting...</> : (
                        patientInput && patientInput.diagnosis && patientInput.diagnosis.length > 0
                          ? "Insert Record"
                          : "Send for Diagnosis"
                      )}
                    </button>
                  </div>
                </div>
                
                <div className='w-[50%] h-full flex flex-col gap-2 py-2'>
                  <div className='h-[48%] w-[95%]'>
                    <textarea
                      name='treatment'
                      value={patientInput.treatment}
                      onChange={handleSetPatientInput}
                      className='h-full w-full p-2 resize-none outline-none rounded-md border'
                      placeholder='Treatment'
                    />
                  </div>

                  <div className='h-[50%] w-[95%]'>
                    <textarea
                      name='notes'
                      value={patientInput.notes}
                      onChange={handleSetPatientInput}
                      className='h-full w-full p-2  resize-none outline-none rounded-md border'
                      placeholder='Additional notes'
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default NewPatient