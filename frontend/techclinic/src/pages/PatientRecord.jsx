import React, { useState } from 'react'
import Search from '../assets/image/searcg.svg'
import Printer from '../assets/image/printer.svg'
import Navigation from '../components/Navigation'
import useData from '../store/useDataStore'
import { useNavigate } from 'react-router-dom'
const PatientRecord = () => {
  const { patientRecords } = useData();
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Department");
  const navigate = useNavigate();
  console.log("ito mga patientRecords", patientRecords);

  const filteredRecords = patientRecords?.data?.filter((patient) => {
    const fullname = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    const matchesSearch = fullname.includes(search.toLowerCase()) || patient.student_id.toLowerCase()
    .includes(search.toLowerCase());
    
    const matchesDepartment = selectedDepartment === "All Department" || patient.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  console.log("mga nasearch", filteredRecords);

  const handleIndividualRecord = (patientId) => {
    try {
      navigate(`/individual-record/${patientId}`);
    } catch (err) {
      console.error(`Someting went wrong navigating to indidual record: ${patientId}`);
      return;
    }
  }
  
  return (
    <div className='flex h-full w-full gap-2'>
        <div className='sm:w-[30%] w-[17%] h-full md:w-[25%] lg:w-[17%]'> 
          <Navigation />
        </div>
        <div className='w-[83%]  h-full flex justify-center p-5'>
            <div className='w-full h-full flex flex-col items-center gap-5 scrollbar'  >
                <div className='w-full flex flex-col gap-2'>
                    <p className='text-[1.5rem] font-semibold text-gray-900'>Patient Record</p>
                    <p className='text-[1rem] text-gray-500'>Manage patient information and medical records</p>
                </div>
                <div className='w-[90%] flex justify-between '>
                    <div className='flex h-[50px]  p-2 rounded-[10px] border border-[#EACBCB] gap-2 w-[50%]' >
                      <img src={Search} alt="" className='h-full'/>
                      <input type="text" className='outline-none w-full'  placeholder='Search'
                      value={search} onChange={(e) => setSearch(e.target.value)}/>
                    </div>

                    <div className='w-[25%] border  h-[50px] border-[#EACBCB] p-2 rounded-[10px]'>
                      <select id="department" name="department"  className='w-full h-full rounded-[10px] outline-none'
                      value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                        <option value="All Department" >All Department</option>
                        <option value="College of Science">College of Science</option>
                        <option value="College of Engineering">College of Engineering</option>
                        <option value="College of Industrial Technology">College of Industrial Technology</option>
                        <option value="College of Architecture and Fine Arts">College of Architecture and Fine Arts</option>
                      </select>
                    </div>

                    <div className='w-[5%] h-[50px]'> 
                      <button className='w-full h-full flex justify-center items-center'>
                         <img src={Printer} alt="" className='h-[50%]' />
                      </button>
                    </div>
                </div>

                <div className=' h-10 w-[90%] flex gap-2 mt-5'>
                    <div className='h-full w-full flex items-center font-medium'>
                      <p className='text-[.9remrem] tracking-[2px]'>Student ID</p>
                    </div>
                    <div className='h-full w-full flex items-center font-medium'>
                      <p className='text-[.9remrem] tracking-[2px]'>Name</p>
                    </div>
                    <div className='h-full w-full flex items-center font-medium'>
                      <p className='text-[.9remrem] tracking-[2px]'>Department</p>
                    </div>
                    <div className='h-full w-full flex items-center font-medium'>
                      <p className='text-[.9remrem] tracking-[2px]'>Diagnosis</p>
                    </div>
                </div>

                <div className='w-[90%] h-full overflow-y-auto '>
                 {filteredRecords?.length > 0 ? (
                    filteredRecords.map((patient) => (
                      <div key={patient.id} className='studentCss cursor-default hover:underline hover:decoration-[#A12217] hover:decoration-2' onClick={() => handleIndividualRecord(patient.id)}>
                        <div className='studentInfoContainer'>
                          <p className='studentInfoData'>{patient.student_id}</p>
                        </div>
                        <div className='studentInfoContainer'>
                          <p className='studentInfoData'>{`${patient.first_name} ${patient.last_name}`}</p>
                          </div>
                        <div className='studentInfoContainer'>
                          <p className='studentInfoData'>{patient.department}</p>
                        </div>
                        <div className='studentInfoContainer'>
                          <p className='studentInfoData'>{patient.diagnoses[0].diagnosis}</p>
                       </div>
                      </div>
                      ))
                     ) : (
                <p className="text-gray-500 text-sm mt-3">No results found.</p>
            )}

             
                </div>
            </div>
        </div>
    </div>
  )
}

export default PatientRecord
