import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, ChevronRight, ChevronLeft, FileText, Download, ChevronDown, Building2, Activity } from 'lucide-react'
import useData from '../store/useDataStore'
import { useNavigate } from 'react-router-dom'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const ROWS_OPTIONS = [5, 10, 20, 50];

const PatientRecord = () => {
  const { patientRecords, getRecords, isLoadingRecords } = useData();
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Department");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
  const [deptOpen, setDeptOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const deptRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (deptRef.current && !deptRef.current.contains(e.target)) setDeptOpen(false);
      if (statusRef.current && !statusRef.current.contains(e.target)) setStatusOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!patientRecords) {
        await getRecords();
      }
      setInitialLoading(false);
    };
    fetchData();
  }, []);

  const filteredRecords = useMemo(() => {
    if (!patientRecords?.data) return [];
    return patientRecords.data.filter((patient) => {
      const fullname = `${patient.first_name} ${patient.last_name}`.toLowerCase();
      const matchesSearch = fullname.includes(search.toLowerCase()) || patient.student_id.toLowerCase()
        .includes(search.toLowerCase());
      const matchesDepartment = selectedDepartment === "All Department" || patient.department === selectedDepartment;
      const matchesStatus = selectedStatus === "All Status" || patient.status === selectedStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [patientRecords, search, selectedDepartment, selectedStatus]);

  const totalPages = Math.ceil((filteredRecords?.length || 0) / rowsPerPage);
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage, rowsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDepartment, selectedStatus, rowsPerPage]);

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className='flex flex-col gap-4 h-full'>
      {initialLoading || isLoadingRecords ? (
        <div className='w-full h-full flex flex-col gap-5 animate-pulse'>
          {/* Skeleton Header */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 rounded-xl bg-gray-200' />
              <div>
                <div className='h-6 w-44 bg-gray-200 rounded-lg' />
                <div className='h-4 w-24 bg-gray-100 rounded-lg mt-2' />
              </div>
            </div>
          </div>
          {/* Skeleton Filters */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='h-10 w-36 bg-gray-200 rounded-full' />
              <div className='h-10 w-28 bg-gray-200 rounded-full' />
            </div>
            <div className='h-10 w-56 bg-gray-200 rounded-full' />
          </div>
          {/* Skeleton Table */}
          <div className='bg-white rounded-xl ring-1 ring-gray-100 flex-1 flex flex-col overflow-hidden'>
            <div className='px-5 py-3 flex gap-4 border-b border-gray-100'>
              {[80, 120, 140, 80, 100, 70].map((w, i) => (
                <div key={i} className='h-4 bg-gray-200 rounded' style={{ width: w }} />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='px-5 py-4 flex items-center gap-4 border-b border-gray-50'>
                <div className='h-4 w-20 bg-gray-100 rounded' />
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-full bg-gray-200' />
                  <div className='h-4 w-28 bg-gray-100 rounded' />
                </div>
                <div className='h-4 w-32 bg-gray-100 rounded hidden lg:block' />
                <div className='h-4 w-20 bg-gray-100 rounded hidden md:block' />
                <div className='h-4 w-24 bg-gray-100 rounded hidden sm:block' />
                <div className='h-6 w-16 bg-gray-100 rounded-full' />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className='w-full h-full flex flex-col gap-5'
        >
          {/* ─── Page Header ─── */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 rounded-xl bg-crimson-50 flex items-center justify-center ring-1 ring-crimson-100'>
                <FileText className="w-6 h-6 text-crimson-600" />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-gray-800'>Patient Records</h1>
                <p className='text-sm text-gray-400 mt-0.5'>

                </p>
              </div>
            </div>
          </motion.div>

          {/* ─── Filters & Search ─── */}
          <motion.div variants={itemVariants} className='flex items-center justify-between gap-3 flex-wrap'>
            {/* Left: Filters */}
            <div className='flex items-center gap-2 flex-wrap'>
              {/* Department Dropdown */}
              <div ref={deptRef} className='relative'>
                <button
                  onClick={() => { setDeptOpen(!deptOpen); setStatusOpen(false); }}
                  className='inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white ring-1 ring-gray-200 text-xs font-medium text-gray-600 hover:ring-gray-300 transition-all cursor-pointer'
                >
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span>{selectedDepartment}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${deptOpen ? 'rotate-180' : ''}`} />
                </button>
                {deptOpen && (
                  <div className='absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 py-2 z-20'>
                    {[
                      "All Department",
                      "College of Science",
                      "College of Engineering",
                      "College of Industrial Technology",
                      "College of Architecture and Fine Arts",
                      "College of Industrial Education",
                      "College of Liberal Arts",
                    ].map(dept => (
                      <button
                        key={dept}
                        onClick={() => { setSelectedDepartment(dept); setDeptOpen(false); }}
                        className='w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer'
                      >
                        <div className='flex items-center gap-3'>
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm font-medium text-left ${selectedDepartment === dept ? 'text-crimson-600' : 'text-gray-700'}`}>{dept}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedDepartment === dept ? 'border-crimson-600 bg-crimson-600' : 'border-gray-300'}`}>
                          {selectedDepartment === dept && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div ref={statusRef} className='relative'>
                <button
                  onClick={() => { setStatusOpen(!statusOpen); setDeptOpen(false); }}
                  className='inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white ring-1 ring-gray-200 text-xs font-medium text-gray-600 hover:ring-gray-300 transition-all cursor-pointer'
                >
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span>{selectedStatus}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
                </button>
                {statusOpen && (
                  <div className='absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 py-2 z-20'>
                    {[
                      { value: "All Status", label: "All Status" },
                      { value: "COMPLETE", label: "Complete" },
                      { value: "INCOMPLETE", label: "Pending" },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSelectedStatus(opt.value); setStatusOpen(false); }}
                        className='w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer'
                      >
                        <div className='flex items-center gap-3'>
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm font-medium ${selectedStatus === opt.value ? 'text-crimson-600' : 'text-gray-700'}`}>{opt.label}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedStatus === opt.value ? 'border-crimson-600 bg-crimson-600' : 'border-gray-300'}`}>
                          {selectedStatus === opt.value && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Search */}
            <div className='flex items-center gap-2'>
              <div className='flex items-center h-10 w-56 px-3 rounded-full bg-white ring-1 ring-gray-200 focus-within:ring-crimson-400 transition-all'>
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  className='outline-none w-full ml-2 text-xs text-gray-700 placeholder:text-gray-400 bg-transparent'
                  placeholder='Search...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* ─── Records Table ─── */}
          <motion.div variants={itemVariants} className='bg-white rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden ring-1 ring-gray-100'>
            <div className='overflow-auto flex-1'>
              {paginatedRecords?.length > 0 ? (
                <table className='w-full'>
                  <thead className='sticky top-0 bg-gray-50/95 backdrop-blur-sm'>
                    <tr>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Patient ID</th>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Name</th>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell'>Department</th>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell'>Date</th>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell'>Diagnosis</th>
                      <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Status</th>
                      <th className='w-10'></th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-50'>
                    {paginatedRecords.map((patient, idx) => (
                      <tr
                        key={patient.id}
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
                        <td className='px-5 py-3.5 hidden lg:table-cell'>
                          <span className='text-sm text-gray-600'>{patient.department}</span>
                        </td>
                        <td className='px-5 py-3.5 hidden md:table-cell'>
                          <span className='text-sm text-gray-500'>{formatDate(patient.created_at)}</span>
                        </td>
                        <td className='px-5 py-3.5 hidden sm:table-cell'>
                          <span className='text-sm text-gray-600 truncate max-w-[180px] block'>
                            {patient.diagnoses[0]?.diagnosis || (
                              <span className='text-gray-400 italic'>Pending</span>
                            )}
                          </span>
                        </td>
                        <td className='px-5 py-3.5'>
                          {patient.status === "COMPLETE" ? (
                            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'>
                              Complete
                            </span>
                          ) : (
                            <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-100'>
                              Pending
                            </span>
                          )}
                        </td>
                        <td className='px-3 py-3.5'>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-crimson-500 group-hover:translate-x-0.5 transition-all" />
                        </td>
                      </tr>
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

            {/* ─── Pagination ─── */}
            {totalPages > 0 && (
              <div className='flex items-center justify-between px-5 py-3 border-t border-gray-100'>
                <span className='text-xs text-gray-500 font-medium'>
                  Total Records: {filteredRecords.length}
                </span>

                <div className='flex items-center gap-1'>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-crimson-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer'
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer
                        ${currentPage === page
                          ? 'bg-crimson-600 text-white shadow-sm'
                          : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-crimson-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer'
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className='flex items-center gap-2'>
                  <span className='text-xs text-gray-500 font-medium'>Show per Page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className='h-8 px-2 rounded-lg bg-white ring-1 ring-gray-200 outline-none text-xs font-medium text-gray-600 focus:ring-crimson-400 transition-all cursor-pointer'
                  >
                    {ROWS_OPTIONS.map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default PatientRecord
