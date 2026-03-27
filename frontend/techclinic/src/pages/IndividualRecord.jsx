import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api';
import { Phone, Mail, Building2, MapPin, ArrowLeft, ChevronRight, Stethoscope, Plus, Layers, Pill, Clock, User, GraduationCap, IdCard, Calendar, FileText, ClipboardList } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'
import DiagnosisModal from '../components/DiagnosisModal'

const IndividualRecord = () => {
  const { studentId } = useParams();
  const [ patientRecord, setPatientRecord ] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const navigate = useNavigate();
  useEffect(() => { 
    const fetchData = async () => {
      try {
        setIsLoading(true);
         const response = await api.get(`/get-record/${studentId}`);
        
         if (response.status !== 200) {
           console.error(`Error getting record: HTTP ${response.status}`);
           return;
         }

         setAllRecords(response.data.data);
         setPatientRecord(response.data.data[0]);
     
      } catch (err) {
        console.error(`Something went wrong getting record: ${err?.message}`);
        return;
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  const handleOpenRecord = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  const latestVisit = patientRecord?.diagnoses?.[0]?.created_at ? new Date(patientRecord.diagnoses[0].created_at) : null;

  const latestDate = latestVisit
    ? latestVisit.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;


  const getInitials = () => {
    const first = patientRecord?.first_name?.[0] ?? '';
    const last = patientRecord?.last_name?.[0] ?? '';
    return (first + last).toUpperCase() || '?';
  };

  const totalVisits = allRecords?.length ?? 0;

  const tabs = [
    { key: 'info', label: 'Patient Information', icon: <User className="w-4 h-4" /> },
    { key: 'medical', label: 'Medical Record', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
      <div className='flex flex-col gap-5'>

        {isLoading ? (
          <div className='flex flex-col gap-5 animate-pulse'>
            {/* Skeleton Breadcrumb */}
            <div className='h-4 w-48 bg-gray-200 dark:bg-[#1F242F] rounded' />
            {/* Skeleton Profile */}
            <div className='bg-white dark:bg-[#161B26] rounded-xl ring-1 ring-gray-100 dark:ring-[#1F2A37] p-6'>
              <div className='flex items-center gap-5'>
                <div className='w-16 h-16 rounded-full bg-gray-200 dark:bg-[#1F242F]' />
                <div className='flex-1'>
                  <div className='h-6 w-48 bg-gray-200 dark:bg-[#1F242F] rounded' />
                  <div className='h-4 w-32 bg-gray-100 dark:bg-[#1F242F] rounded mt-2' />
                </div>
                <div className='h-10 w-40 bg-gray-200 dark:bg-[#1F242F] rounded-xl' />
              </div>
            </div>
            {/* Skeleton Tabs */}
            <div className='flex gap-6 border-b border-gray-100 dark:border-[#1F2A37] pb-2'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='h-4 w-28 bg-gray-200 dark:bg-[#1F242F] rounded' />
              ))}
            </div>
            {/* Skeleton Content */}
            <div className='bg-white dark:bg-[#161B26] rounded-xl ring-1 ring-gray-100 dark:ring-[#1F2A37] p-6'>
              <div className='grid grid-cols-3 gap-6'>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i}>
                    <div className='h-3 w-20 bg-gray-200 dark:bg-[#1F242F] rounded mb-2' />
                    <div className='h-5 w-32 bg-gray-100 dark:bg-[#1F242F] rounded' />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-5"
        >

        {/* ─── Breadcrumb ─── */}
        <nav className='flex items-center gap-2 text-sm'>
          <Link to='/patient-record' className='text-gray-400 dark:text-[#94969C] hover:text-crimson-600 dark:hover:text-crimson-300 transition-colors'>
            Patient list
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-[#94969C]" />
          <span className='text-crimson-600 dark:text-crimson-300 font-medium'>Patient detail</span>
        </nav>

        {/* ─── Profile Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
          className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] p-6'
        >
          <div className='flex flex-col sm:flex-row sm:items-center gap-5'>
            {/* Avatar */}
            <div className='w-16 h-16 rounded-full bg-linear-to-br from-crimson-600 to-crimson-500 dark:from-crimson-700 dark:to-crimson-500 flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-[#1F2A37] shadow-md'>
              <span className='text-white text-xl font-bold'>{getInitials()}</span>
            </div>

            {/* Name & Meta */}
            <div className='flex-1 min-w-0'>
              <h1 className='text-xl font-bold text-gray-900 dark:text-white'>
                {`${patientRecord?.first_name ?? ''} ${patientRecord?.last_name ?? ''}`}
              </h1>
              <div className='flex items-center gap-3 mt-1.5 flex-wrap'>
                <span className='inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-[#94969C]'>
                  <IdCard className="w-3.5 h-3.5" />
                  {studentId ?? '—'}
                </span>
                <span className='text-gray-300 dark:text-[#333741]'>|</span>
                <span className='inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-[#94969C]'>
                  <Building2 className="w-3.5 h-3.5" />
                  {patientRecord?.department ?? '—'}
                </span>
                <span className='text-gray-300 dark:text-[#333741]'>|</span>
                <span className='inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-[#94969C]'>
                  <GraduationCap className="w-3.5 h-3.5" />
                  Year {patientRecord?.year_level ?? patientRecord?.year ?? '—'}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate('/new-patient', { 
                state: { 
                  patientData: {
                    studentId: studentId,
                    firstName: patientRecord?.first_name || '',
                    lastName: patientRecord?.last_name || '',
                    email: patientRecord?.email || '',
                    contactNumber: patientRecord?.contact_number || '',
                    yearLevel: patientRecord?.year_level || '',
                    department: patientRecord?.department || '',
                    sex: patientRecord?.sex || '',
                    dateOfBirth: patientRecord?.date_of_birth || patientRecord?.dob || '',
                    address: patientRecord?.address || '',
                  }
                }
              })}
              className='inline-flex items-center gap-2 px-5 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shrink-0 cursor-pointer'
            >
              <Calendar className="w-4 h-4" />
              Create Appointment
            </button>
          </div>
        </motion.div>

        {/* ─── Tab Navigation ─── */}
        <div className='border-b border-gray-200 dark:border-[#1F2A37]'>
          <div className='flex gap-0'>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.key
                    ? 'border-crimson-600 text-crimson-600 dark:text-crimson-300 dark:border-crimson-400'
                    : 'border-transparent text-gray-500 dark:text-[#94969C] hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {tab.icon}
                <span className='hidden sm:inline'>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── Tab Content ─── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* ═══ Patient Information Tab ═══ */}
            {activeTab === 'info' && (
              <div className='flex flex-col gap-5'>
                {/* Personal Details */}
                <div className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] p-6'>
                  <div className='flex items-center gap-2.5 mb-5'>
                    <div className='w-1 h-5 bg-crimson-600 rounded-full' />
                    <h3 className='text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wide'>Personal Details</h3>
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5'>
                    {[
                      { label: 'Full Name', value: `${patientRecord?.first_name ?? ''} ${patientRecord?.last_name ?? ''}` },
                      { label: 'Student ID', value: studentId },
                      { label: 'Department', value: patientRecord?.department },
                      { label: 'Year Level', value: patientRecord?.year_level ?? patientRecord?.year },
                      { label: 'Sex', value: patientRecord?.sex },
                      { label: 'Date of Birth', value: patientRecord?.date_of_birth || patientRecord?.dob ? new Date(patientRecord.date_of_birth || patientRecord.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null },
                    ].map((field, idx) => (
                      <div key={idx}>
                        <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider'>{field.label}</p>
                        <p className='text-sm font-semibold text-gray-800 dark:text-white mt-1'>{field.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] p-6'>
                  <div className='flex items-center gap-2.5 mb-5'>
                    <div className='w-1 h-5 bg-crimson-600 rounded-full' />
                    <h3 className='text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wide'>Contact Information</h3>
                  </div>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5'>
                    {[
                      { label: 'Phone Number', value: patientRecord?.contact_number, icon: <Phone className="w-4 h-4 text-gray-400 dark:text-[#94969C]" /> },
                      { label: 'Email Address', value: patientRecord?.email, icon: <Mail className="w-4 h-4 text-gray-400 dark:text-[#94969C]" /> },
                      { label: 'Address', value: patientRecord?.address, icon: <MapPin className="w-4 h-4 text-gray-400 dark:text-[#94969C]" /> },
                    ].map((field, idx) => (
                      <div key={idx}>
                        <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider'>{field.label}</p>
                        <div className='flex items-center gap-2 mt-1'>
                          {field.icon}
                          <p className='text-sm font-semibold text-gray-800 dark:text-white'>{field.value || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                  <div className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] p-5 flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-xl bg-crimson-50 dark:bg-[#1F242F] flex items-center justify-center'>
                      <ClipboardList className="w-5 h-5 text-crimson-600" />
                    </div>
                    <div>
                      <p className='text-2xl font-bold text-gray-900 dark:text-white'>{totalVisits}</p>
                      <p className='text-xs text-gray-400 dark:text-[#94969C]'>Total Visits</p>
                    </div>
                  </div>
                  <div className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] p-5 flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-xl bg-amber-50 dark:bg-[#1F242F] flex items-center justify-center'>
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className='text-2xl font-bold text-gray-900 dark:text-white'>{allRecords?.filter(r => r.status === 'INCOMPLETE').length ?? 0}</p>
                      <p className='text-xs text-gray-400 dark:text-[#94969C]'>Pending</p>
                    </div>
                  </div>
                  <div className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] p-5 flex items-center gap-4'>
                    <div className='w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#1F242F] flex items-center justify-center'>
                      <Stethoscope className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className='text-sm font-bold text-gray-900 dark:text-white'>{latestDate ?? 'None'}</p>
                      <p className='text-xs text-gray-400 dark:text-[#94969C]'>Last Visit</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ Medical Record Tab ═══ */}
            {activeTab === 'medical' && (
              <div className='flex flex-col gap-5'>
                {(!allRecords || allRecords.length === 0) ? (
                  <div className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] py-16 text-center'>
                    <div className='w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 dark:bg-[#1F242F] flex items-center justify-center'>
                      <FileText className="w-7 h-7 text-gray-300 dark:text-[#94969C]" />
                    </div>
                    <p className='text-gray-500 dark:text-[#94969C] font-medium text-sm'>No medical records available</p>
                    <p className='text-xs text-gray-400 dark:text-[#94969C] mt-1'>Diagnosis and treatment data will appear here</p>
                  </div>
                ) : (
                  allRecords.map((record, rIdx) => {
                    const diagDate = record?.created_at
                      ? new Date(record.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                      : '—';

                    return (
                      <motion.div
                        key={record?.id ?? rIdx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: rIdx * 0.05, duration: 0.3 }}
                        className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] overflow-hidden'
                      >
                        {/* Record header */}
                        <div className='px-6 py-4 border-b border-gray-100 dark:border-[#1F2A37] flex items-center justify-between'>
                          <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 rounded-lg bg-crimson-50 dark:bg-[#1F242F] flex items-center justify-center'>
                              <Stethoscope className="w-4 h-4 text-crimson-600" />
                            </div>
                            <div>
                              <p className='text-sm font-semibold text-gray-800 dark:text-white'>Visit — {diagDate}</p>
                              <p className='text-xs text-gray-400 dark:text-[#94969C]'>
                                {record?.attending_physician ? `Dr. ${record.attending_physician}` : 'No physician assigned'}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-3'>
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${
                              record?.status === 'COMPLETE' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-emerald-100 dark:ring-emerald-900/60' 
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-amber-100 dark:ring-amber-900/60'
                            }`}>
                              {record?.status ?? '—'}
                            </span>
                            <button
                              onClick={() => handleOpenRecord(record)}
                              className='text-xs text-crimson-600 dark:text-crimson-300 hover:text-crimson-700 dark:hover:text-crimson-200 font-medium transition-colors cursor-pointer'
                            >
                              View Details →
                            </button>
                          </div>
                        </div>

                        {/* Diagnoses grid */}
                        <div className='p-6'>
                          {record?.diagnoses?.length > 0 ? (
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4'>
                              {record.diagnoses.map((d, dIdx) => (
                                <React.Fragment key={d?.id ?? dIdx}>
                                  <div>
                                    <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider'>Diagnosis</p>
                                    <p className='text-sm font-semibold text-gray-800 dark:text-white mt-1'>{d?.diagnosis || '—'}</p>
                                  </div>
                                  <div>
                                    <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider'>Medication</p>
                                    <p className='text-sm font-semibold text-gray-800 dark:text-white mt-1'>{d?.medication || '—'}</p>
                                  </div>
                                  <div>
                                    <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] uppercase tracking-wider'>Treatment</p>
                                    <p className='text-sm font-semibold text-gray-800 dark:text-white mt-1'>{d?.treatment || '—'}</p>
                                  </div>
                                </React.Fragment>
                              ))}
                            </div>
                          ) : (
                            <p className='text-sm text-gray-400 dark:text-[#94969C] italic'>No diagnoses recorded for this visit</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </motion.div>
      )}
      <DiagnosisModal 
        open={showModal} 
        onClose={handleCloseModal} 
        patient={patientRecord} 
        record={selectedRecord} 
        diagnoses={selectedRecord?.diagnoses ?? []} 
      />
      </div>
  )
}

export default IndividualRecord