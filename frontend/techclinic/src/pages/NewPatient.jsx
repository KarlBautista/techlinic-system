import React from 'react'
import Navigation from '../components/Navigation'
import {useState} from 'react'
import useData from '../store/useDataStore'
import useAuth from '../store/useAuthStore'
import Swal from 'sweetalert2'
import { useEffect } from 'react'
import useMedicine from "../store/useMedicineStore";
const NewPatient = () => {
  const { insertRecord, getRecords, getRecordsFromExistingPatient } = useData();
  const { authenticatedUser } = useAuth();
  const { medicines } = useMedicine();
  const [studentInformation, setStudentInformation] = useState(null);
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
    diagnosis: "",
    medication: {},
    quantity: "",
    treatment: "",
    notes: "",
    attendingPhysician: authenticatedUser?.user_metadata?.full_name,
  });

  // Normalize various date formats to YYYY-MM-DD for <input type="date">
  const formatDateForInput = (val) => {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d)) return '';
      // toISOString gives YYYY-MM-DDTHH:MM:SS.sssZ -> slice to get YYYY-MM-DD
      return d.toISOString().slice(0, 10);
    } catch (e) {
      return '';
    }
  }

  // PAG NAGING 10 NA LENGTH NG STUDENT ID MAG FEFETCH
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




  const handleSetPatientInput = (e) => {
    const { name, value } = e.target;

    if(name === "medication"){
      const medjObj = medicines.find((m) => m.id === Number(value));
      setPatientInput((prev) => ({...prev, medication: medjObj}));
        return; // ← IMPORTANT
    }
    setPatientInput((prev) => ({ ...prev, [name]: value }));
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
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
          diagnosis: "",
          medication: "",
          quantity: "",
          treatment: "",
          notes: "",
        });
        getRecords();
      }
    } catch (err) {
      console.error(err);
    }
  }


  return (
<div className='flex h-full w-full gap-2'>
        <div className='sm:w-[30%] w-[17%] h-full md:w-[25%] lg:w-[17%]'>
          <Navigation />
        </div>


  
        <div className='w-[83%]  h-full flex justify-center p-5'>
            <div className='w-full overflow-y-scroll h-full flex flex-col items-center gap-5 scrollbar'  >
                <div className='w-full flex flex-col gap-2'>
                    <p className='text-[1.5rem] font-semibold text-gray-900'>Add Patient Record</p>
                    <p className='text-[1rem] text-gray-500'>Patient Clinical Documentation</p>
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
                      <input type="text"
                      name='address'
                      placeholder=''
                      id='address'
                      value={patientInput.address}
                      onChange={handleSetPatientInput} />
                      <label htmlFor="address" className='text-[.8rem]'>Address</label>
                    </div>

                      <div className='formInfo'>
                      <input type="date"
                      name='dateOfBirth'
                      placeholder=''
                      id='dateOfBirth'
                      value={patientInput.dateOfBirth}
                      onChange={handleSetPatientInput} />
                      <label htmlFor="address" className='text-[.8rem]'>Date of Birth</label>
                    </div>

                  

                 


                  <div className='w-full mt-10'>
                    <p className='text-[1rem]'>Medical Information</p>
                  </div>
                  <div className='border border-gray-200 w-full'></div>
                    
                  <div className='w-full h-[400px] flex'>
                      <div className='w-[50%] h-full flex items-center flex-col '>
                          <div className='formDiagnosis'>
                            <select id="diagnosis" name="diagnosis" value={patientInput.diagnosis} onChange={handleSetPatientInput} className='w-full p-2 rounded-[10px] border outline-none'>
                              <option value="" disabled>Diagnosis</option>
                              <option value="HEENT">HEENT</option>
                              <option value="Pulmonary">Chest and Lungs / Pulmonary</option>
                              <option value="Heart">Heart</option>
                              <option value="Endocrine">Endocrine</option>
                              <option value="Gastrointestinal">Gastrointestinal</option>
                              <option value="Genito-Urinary">Genito-Urinary</option>
                              <option value="Musculoskeletal">Musculoskeletal</option>
                              <option value="Surgical">Surgical</option>
                              <option value="Neurology">Neurology / Psych</option>
                              <option value="Derma">Derma</option>
                              <option value="Infectious Disease">Infectious Disease</option>
                            </select>
                          </div>

                          <div className='formDiagnosis'>
                              <select id="medication" name="medication" value={patientInput.medication?.id || ""} onChange={handleSetPatientInput} className='w-full p-2 rounded-[10px] border outline-none'>
                              <option value="" disabled>Medication</option>
                                {medicines?.map((medicine) => {
                                return <option key={medicine.id} value={medicine.id}>{`${medicine.medicine_name}, ${medicine.generic_name} - ${medicine.stock_level} in stock`}</option>
                                })}
                                   
                                
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
                          {/*ito button*/}
                          <div className='w-full h-[50%]  flex justify-center items-center'>
                            <button className='text-white px-5 py-3 rounded-lg bg-[#ef4444]'>Insert Record</button>
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
        </div>
    </div>
  )
}

export default NewPatient
