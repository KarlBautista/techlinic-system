import React, { useState, useEffect } from 'react'
import Search from '../assets/image/searcg.svg'
import Printer from '../assets/image/printer.svg'
import Navigation from '../components/newNavigation'
import useData from '../store/useDataStore'
import { useNavigate } from 'react-router-dom'
import { PageLoader } from '../components/PageLoader'
const PatientRecord = () => {
  const { patientRecords, getRecords, isLoadingRecords } = useData();
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Department");
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientRecords) {
        await getRecords();
      }
      setInitialLoading(false);
    };
    fetchData();
  }, []);

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

  const handleIndividualRecord = (studentId) => {
    try {
      navigate(`/individual-record/${studentId}`);
    } catch (err) {
      console.error(`Someting went wrong navigating to indidual record: ${studentId}`);
      return;
    }
  }

  return (
    <div className='h-screen w-full flex flex-col sm:flex-row'>
      <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%]'>
        <Navigation />
      </div>
      <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-6 flex flex-col gap-4'>
        {initialLoading || isLoadingRecords ? (
          <PageLoader message="Loading patient records..." />
        ) : (
        <div className='w-full h-full flex flex-col items-center gap-5 scrollbar'  >
          <div className='w-full flex flex-col gap-2'>
            <h1 className='text-2xl font-bold text-gray-800'>Patient Record</h1>
            <p className='text-sm text-gray-500 mt-1'>Manage patient information and medical records</p>
          </div>
          <div className='w-[90%] flex justify-between '>
            <div className='flex h-[50px]  p-2 rounded-[10px] border border-[#EACBCB] gap-2 w-[50%]' >
              <img src={Search} alt="" className='h-full' />
              <input type="text" className='outline-none w-full' placeholder='Search'
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className='w-[25%] border  h-[50px] border-[#EACBCB] p-2 rounded-[10px]'>
              <select id="department" name="department" className='w-full h-full rounded-[10px] outline-none'
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
              <p className='text-[.9rem] tracking-[2px]'>Student ID</p>
            </div>
            <div className='h-full w-full flex items-center font-medium'>
              <p className='text-[.9rem] tracking-[2px]'>Name</p>
            </div>
            <div className='h-full w-full flex items-center font-medium'>
              <p className='text-[.9rem] tracking-[2px]'>Department</p>
            </div>
            <div className='h-full w-full flex items-center font-medium'>
              <p className='text-[.9rem] tracking-[2px]'>Diagnosis</p>
            </div>
          </div>

          <div className='w-[90%] h-full overflow-y-auto '>
            {filteredRecords?.length > 0 ? (
              filteredRecords.map((patient) => (
                <div key={patient.id} className='studentCss cursor-default hover:underline hover:decoration-[#A12217] hover:decoration-2' onClick={() => handleIndividualRecord(patient.student_id)}>
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
                    <p className='studentInfoData'>{patient.diagnoses[0]?.diagnosis}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm mt-3">No results found.</p>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default PatientRecord
