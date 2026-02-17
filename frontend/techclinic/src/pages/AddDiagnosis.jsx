import React from 'react'
import Navigation from '../components/newNavigation'
import { useState } from 'react'
import useData from '../store/useDataStore'
import useAuth from '../store/useAuthStore'
import Swal from 'sweetalert2'
import { useEffect } from 'react'
import useMedicine from "../store/useMedicineStore";
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { PageLoader, ButtonLoader } from '../components/PageLoader'
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
    setPatientInput({
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

    })
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
        Swal.fire({
          title: "Medicine Out of Stock",
          text: `${medjObj.medicine_name} is currently out of stock. Please select another medicine.`,
          icon: "warning",
          confirmButtonColor: "#CB2727"
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

    // Validate if trying to prescribe out-of-stock medicine
    if (patientInput.medication && patientInput.medication.id && patientInput.quantity) {
      if (patientInput.medication.stock_level === 0) {
        Swal.fire({
          title: "Medicine Out of Stock",
          text: `${patientInput.medication.medicine_name} is out of stock. Cannot prescribe this medicine.`,
          icon: "error",
          confirmButtonColor: "#CB2727"
        });
        return;
      }

      // Check if quantity exceeds available stock
      const quantityRequested = parseInt(patientInput.quantity, 10);
      if (quantityRequested > patientInput.medication.stock_level) {
        Swal.fire({
          title: "Insufficient Stock",
          text: `Only ${patientInput.medication.stock_level} units of ${patientInput.medication.medicine_name} available. You requested ${quantityRequested} units.`,
          icon: "warning",
          confirmButtonColor: "#CB2727"
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

        Swal.fire({
          title: "Diagnosis Successfully Inserted",
          icon: 'success',
        });
        navigate(`/individual-record/${patientInput.studentId}`);



      } else {
        Swal.fire({
          title: "Something went wrong inserting diagnosis",
          icon: "error",
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
    <div className='h-screen w-full flex flex-col sm:flex-row'>
      <div className='h-[8%] w-full order-last sm:order-0 sm:w-[20%] sm:h-full md:w-[16%] lg:w-[14%]'>
        <Navigation />
      </div>



      <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[80%] md:w-[84%] lg:w-[86%] overflow-auto p-6 flex flex-col gap-4'>
        {isLoading ? (
          <PageLoader message="Loading diagnosis form..." />
        ) : (
        <div className='w-full overflow-y-scroll h-full flex flex-col items-center gap-5 scrollbar'  >
          <div className='w-full flex flex-col gap-2'>
            <h1 className='text-2xl font-bold text-gray-800'>Add Patient Diagnosis</h1>
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
                    <div className='flex flex-col gap-2'>
                      <div className='flex items-center gap-2'>
                        <select id="diseaseId" name="diseaseId" value={patientInput.diseaseId} onChange={handleSetPatientInput} className='flex-1 p-2 rounded-[10px] border outline-none'>
                          <option value="" disabled>Select Diagnosis</option>
                          {diseases && diseases.length > 0 ? (
                            diseases.map((disease) => <option key={disease.id} value={disease.id}>{disease.name}</option>)
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
                        <div className='flex items-center gap-2'>
                          <input
                            type="text"
                            value={newDiseaseName}
                            onChange={(e) => setNewDiseaseName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDisease(); } }}
                            placeholder="Enter disease name..."
                            className='flex-1 p-2 rounded-[10px] border outline-none text-sm focus:border-[#b01c34] transition-colors'
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
                    <button disabled={isSubmitting} className='text-white px-5 py-3 rounded-lg bg-[#ef4444] inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'>{isSubmitting ? <><ButtonLoader /> Submitting...</> : 'Insert Record'}</button>
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

export default AddDiagnosis
