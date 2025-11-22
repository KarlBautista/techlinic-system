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

  function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

  console.log("mga nasearch", filteredRecords);

  const handleIndividualRecord = (studentId) => {
    try {
      navigate(`/individual-record/${studentId}`);
    } catch (err) {
      console.error(`Someting went wrong navigating to indidual record: ${studentId}`);
      return;
    }
  }
  
  return (
    <div className='flex h-full w-full gap-2'>
        <div className='sm:w-[30%] w-[17%] h-full md:w-[25%] lg:w-[17%] sticky top-0'> 
          <Navigation />
        </div>
        <div className='w-[83%]  h-full flex justify-center p-5'>
            <div className='w-full h-full flex flex-col items-center gap-5 scrollbar'  >
                <div className='w-full flex flex-col gap-2'>
                    <p className='text-[1.5rem] font-semibold text-gray-900'>Patient Record</p>
                    <p className='text-[1rem] text-gray-500'>Manage patient information and medical records</p>
                </div>
                <div className='w-[90%] flex flex-col md:flex-row md:items-center justify-between gap-3'>
             
                  <div className='flex-1 md:max-w-[50%] w-full'>
                    <div className='relative'>
                      <img src={Search} alt="search" className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-70' />
                      <input
                        type="text"
                        className='outline-none w-full pl-12 pr-4 h-12 rounded-lg border border-[#EACBCB] focus:ring-2 focus:ring-[#b01c34] transition'
                        placeholder='Search by name or student ID'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className='w-full md:w-1/4'>
                    <select
                      id="department"
                      name="department"
                      className='w-full h-12 rounded-lg border border-[#EACBCB] px-4 outline-none focus:ring-2 focus:ring-[#b01c34]'
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                      <option value="All Department">All Department</option>
                      <option value="College of Science">College of Science</option>
                      <option value="College of Engineering">College of Engineering</option>
                      <option value="College of Industrial Technology">College of Industrial Technology</option>
                      <option value="College of Architecture and Fine Arts">College of Architecture and Fine Arts</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className='w-full md:w-auto flex items-center gap-2'>
                    <button
                      className='h-12 px-4 rounded-lg bg-[#b01c34] text-white flex items-center gap-2 hover:bg-[#9a1528] transition'
                      title='Print'
                    >
                      <img src={Printer} alt="print" className='w-5 h-5' />
                      <span className='hidden md:inline'>Print</span>
                    </button>
                    <button
                      className='h-12 px-3 rounded-lg border border-[#EACBCB] bg-white text-gray-700 hover:bg-gray-50 transition'
                      onClick={() => { setSearch(''); setSelectedDepartment('All Department'); }}
                      title='Clear filters'
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className='w-full overflow-x-auto py-4'>
                  <div className='w-[95%] mx-auto bg-white rounded-xl shadow-lg overflow-hidden'>
                      <table className='min-w-[1000px] w-full table-auto bg-transparent rounded-xl' >
                      <thead className='bg-[#A12217]'>
                        <tr>
                          <th className='px-6 py-4 text-left text-lg font-semibold text-white'>Student ID</th>
                          <th className='px-6 py-4 text-left text-lg font-semibold text-white'>Name</th>
                          <th className='px-6 py-4 text-left text-lg font-semibold text-white'>Diagnosis</th>
                          <th className='px-6 py-4 text-left text-lg font-semibold text-white'>Department</th>
                          <th className='px-6 py-4 text-left text-lg font-semibold text-white'>Created at</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords?.map((patient) => (
                          <tr key={patient.id} className='bg-white even:bg-gray-50 hover:bg-[#FFF1F1] transition-colors cursor-pointer' onClick={() => handleIndividualRecord(patient.student_id)}>
                            <td className='px-6 py-4 text-base text-gray-800'>{patient.student_id}</td>
                            <td className='px-6 py-4 text-base text-gray-800'>{`${patient.first_name} ${patient.last_name}`}</td>
                            <td className='px-6 py-4 text-base text-gray-800'>{patient.diagnoses?.[0]?.diagnosis ?? '—'}</td>
                            <td className='px-6 py-4 text-base text-gray-800'>{patient.department}</td>
                            <td className='px-6 py-4 text-base text-gray-800'>{formatDate(patient.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

            

              
            </div>
        </div>
    </div>
  )
}

export default PatientRecord
