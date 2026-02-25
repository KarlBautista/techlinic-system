import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Printer, Users, ChevronRight } from 'lucide-react'
import useData from '../store/useDataStore'
import { useNavigate } from 'react-router-dom'
import { PageLoader } from '../components/PageLoader'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } }
};

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
      console.error(`Something went wrong navigating to individual record: ${studentId}`);
    }
  }

  return (
      <div className='flex flex-col gap-4'>
        {initialLoading || isLoadingRecords ? (
          <PageLoader message="Loading patient records..." />
        ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className='w-full h-full flex flex-col gap-5'
        >
          {/* ─── Page Header ─── */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className='text-2xl font-bold text-gray-800'>Patient Records</h1>
              <p className='text-sm text-gray-500 mt-1'>Manage patient information and medical records</p>
            </div>
            <div className='hidden sm:flex items-center gap-2 px-3 py-1.5 bg-crimson-50 rounded-full ring-1 ring-crimson-100'>
              <Users className="w-3.5 h-3.5 text-crimson-600" />
              <span className='text-xs font-semibold text-crimson-700'>{patientRecords?.data?.length || 0} patients</span>
            </div>
          </motion.div>

          {/* ─── Search & Filter Bar ─── */}
          <motion.div variants={itemVariants} className='flex items-center gap-3 flex-wrap'>
            <div className='flex items-center flex-1 min-w-[200px] max-w-md h-10 px-3 rounded-xl bg-white ring-1 ring-gray-200 focus-within:ring-crimson-400 focus-within:ring-2 transition-all'>
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
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
              className='h-10 px-3 rounded-xl bg-white ring-1 ring-gray-200 outline-none text-sm text-gray-700 focus:ring-crimson-400 focus:ring-2 transition-all cursor-pointer'
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
              className='h-10 w-10 flex items-center justify-center rounded-xl bg-white ring-1 ring-gray-200 hover:bg-gray-50 hover:ring-crimson-200 transition-all'
              title="Print"
            >
              <Printer className="w-4 h-4 text-gray-500" />
            </button>

            {filteredRecords && (
              <span className='text-xs text-gray-400 font-medium ml-auto'>
                {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
              </span>
            )}
          </motion.div>

          {/* ─── Records Table ─── */}
          <motion.div variants={itemVariants} className='bg-white rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden ring-1 ring-gray-100'>
            <div className='overflow-auto flex-1'>
              {filteredRecords?.length > 0 ? (
                <table className='w-full'>
                  <thead className='sticky top-0 bg-gray-50/95 backdrop-blur-sm'>
                    <tr>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Student ID</th>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Name</th>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell'>Department</th>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell'>Diagnosis</th>
                      <th className='w-10'></th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-50'>
                    {filteredRecords.map((patient, idx) => (
                      <motion.tr
                        key={patient.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02, duration: 0.25 }}
                        className='cursor-pointer hover:bg-crimson-50/40 transition-colors group'
                        onClick={() => handleIndividualRecord(patient.student_id)}
                      >
                        <td className='px-5 py-3.5'>
                          <span className='text-sm font-mono font-medium text-gray-900 group-hover:text-crimson-600 transition-colors'>
                            {patient.student_id}
                          </span>
                        </td>
                        <td className='px-5 py-3.5'>
                          <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 rounded-full bg-linear-to-br from-crimson-100 to-crimson-50 flex items-center justify-center text-xs font-bold text-crimson-600 shrink-0 ring-1 ring-crimson-100'>
                              {patient.first_name?.[0]}{patient.last_name?.[0]}
                            </div>
                            <span className='text-sm text-gray-700 font-medium'>{`${patient.first_name} ${patient.last_name}`}</span>
                          </div>
                        </td>
                        <td className='px-5 py-3.5 hidden md:table-cell'>
                          <span className='text-sm text-gray-600'>{patient.department}</span>
                        </td>
                        <td className='px-5 py-3.5 hidden sm:table-cell'>
                          <span className='text-sm text-gray-600'>
                            {patient.diagnoses[0]?.diagnosis || (
                              <span className='text-gray-400 italic'>Pending</span>
                            )}
                          </span>
                        </td>
                        <td className='px-3 py-3.5'>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-crimson-500 group-hover:translate-x-0.5 transition-all" />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className='text-sm font-medium text-gray-500'>No records found</p>
                  <p className='text-xs text-gray-400 mt-1'>Try a different search or filter</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
        )}
      </div>
  )
}

export default PatientRecord
