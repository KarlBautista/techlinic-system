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
      <div className='h-[8%] w-full order-last sm:order-0 sm:w-[20%] sm:h-full md:w-[16%] lg:w-[14%]'>
        <Navigation />
      </div>
      <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[80%] md:w-[84%] lg:w-[86%] overflow-auto p-6 flex flex-col gap-4'>
        {initialLoading || isLoadingRecords ? (
          <PageLoader message="Loading patient records..." />
        ) : (
        <div className='w-full h-full flex flex-col gap-5'>
          {/* ─── Page Header ─── */}
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>Patient Record</h1>
            <p className='text-sm text-gray-500 mt-1'>Manage patient information and medical records</p>
          </div>

          {/* ─── Search & Filter Bar ─── */}
          <div className='flex items-center gap-3 flex-wrap'>
            <div className='flex items-center flex-1 min-w-[200px] max-w-md h-10 px-3 rounded-lg bg-white ring-1 ring-gray-200 focus-within:ring-[#b01c34] transition-all'>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                className='outline-none w-full ml-2 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent'
                placeholder='Search by name or student ID...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              id="department"
              name="department"
              className='h-10 px-3 rounded-lg bg-white ring-1 ring-gray-200 outline-none text-sm text-gray-700 focus:ring-[#b01c34] transition-all cursor-pointer'
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="All Department">All Department</option>
              <option value="College of Science">College of Science</option>
              <option value="College of Engineering">College of Engineering</option>
              <option value="College of Industrial Technology">College of Industrial Technology</option>
              <option value="College of Architecture and Fine Arts">College of Architecture and Fine Arts</option>
            </select>

            <button
              className='h-10 w-10 flex items-center justify-center rounded-lg bg-white ring-1 ring-gray-200 hover:bg-gray-50 transition-colors'
              title="Print"
            >
              <img src={Printer} alt="Print" className='h-4 w-4 opacity-60' />
            </button>

            {filteredRecords && (
              <span className='text-xs text-gray-400 font-medium ml-auto'>
                {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* ─── Records Table ─── */}
          <div className='bg-white rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden'>
            <div className='overflow-auto flex-1'>
              {filteredRecords?.length > 0 ? (
                <table className='w-full'>
                  <thead className='sticky top-0 bg-gray-50/90 backdrop-blur-sm'>
                    <tr>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Student ID</th>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Name</th>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell'>Department</th>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell'>Diagnosis</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-50'>
                    {filteredRecords.map((patient) => (
                      <tr
                        key={patient.id}
                        className='cursor-pointer hover:underline hover:decoration-[#A12217] hover:decoration-2 hover:bg-gray-50/50 transition-colors group'
                        onClick={() => handleIndividualRecord(patient.student_id)}
                      >
                        <td className='px-5 py-3'>
                          <span className='text-sm font-medium text-gray-900 group-hover:text-[#b01c34] transition-colors'>
                            {patient.student_id}
                          </span>
                        </td>
                        <td className='px-5 py-3'>
                          <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0'>
                              {patient.first_name?.[0]}{patient.last_name?.[0]}
                            </div>
                            <span className='text-sm text-gray-700'>{`${patient.first_name} ${patient.last_name}`}</span>
                          </div>
                        </td>
                        <td className='px-5 py-3 hidden md:table-cell'>
                          <span className='text-sm text-gray-600'>{patient.department}</span>
                        </td>
                        <td className='px-5 py-3 hidden sm:table-cell'>
                          <span className='text-sm text-gray-600'>
                            {patient.diagnoses[0]?.diagnosis || (
                              <span className='text-gray-400 italic'>Pending</span>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className='flex flex-col items-center justify-center py-16 text-gray-400'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <p className='text-sm font-medium text-gray-500'>No records found</p>
                  <p className='text-xs text-gray-400 mt-1'>Try a different search or filter</p>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default PatientRecord
