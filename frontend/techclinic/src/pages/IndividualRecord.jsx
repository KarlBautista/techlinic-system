import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api';
import { Phone, Mail, Building2, MapPin, ArrowLeft, ChevronRight, Stethoscope, Plus, Layers, Pill, Clock, User, GraduationCap, IdCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'
import DiagnosisModal from '../components/DiagnosisModal'

const IndividualRecord = () => {
  const { studentId } = useParams();
  const [ patientRecord, setPatientRecord ] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  return (
      <div className='flex flex-col gap-4'>

        {isLoading ? (
          <div className='flex flex-col gap-5 animate-pulse'>
            {/* Skeleton Header */}
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-xl bg-gray-200' />
              <div>
                <div className='h-6 w-40 bg-gray-200 rounded-lg' />
                <div className='h-4 w-56 bg-gray-100 rounded-lg mt-2' />
              </div>
            </div>
            {/* Skeleton Profile Banner */}
            <div className='w-full rounded-2xl bg-gray-200 h-44' />
            {/* Skeleton Contact Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='bg-white rounded-xl ring-1 ring-gray-100 p-4'>
                  <div className='h-3 w-16 bg-gray-200 rounded mb-3' />
                  <div className='h-4 w-32 bg-gray-100 rounded' />
                </div>
              ))}
            </div>
            {/* Skeleton Visit Records */}
            <div className='bg-white rounded-xl ring-1 ring-gray-100 overflow-hidden'>
              <div className='px-5 py-4 border-b border-gray-100 flex items-center justify-between'>
                <div className='h-5 w-28 bg-gray-200 rounded' />
                <div className='h-9 w-28 bg-gray-200 rounded-xl' />
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='px-5 py-4 flex items-center justify-between border-b border-gray-50'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-xl bg-gray-200' />
                    <div>
                      <div className='h-4 w-36 bg-gray-100 rounded' />
                      <div className='h-3 w-24 bg-gray-100 rounded mt-2' />
                    </div>
                  </div>
                  <div className='h-6 w-16 bg-gray-100 rounded-full' />
                </div>
              ))}
            </div>
          </div>
        ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-5"
        >
        {/* Header with back button */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className='flex items-center gap-3'
        >
          <button 
            onClick={() => navigate(-1)} 
            className='w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:bg-crimson-50 hover:border-crimson-200 hover:text-crimson-600 transition-all shadow-sm text-gray-600'
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>Patient Record</h1>
            <p className='text-sm text-gray-500 mt-0.5'>View patient details and visit history</p>
          </div>
        </motion.div>

        {/* Profile Banner Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className='bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden'
        >
          {/* Gradient Banner */}
          <div className='h-28 bg-linear-to-br from-crimson-700 via-crimson-600 to-crimson-500 relative'>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className='absolute -bottom-10 left-6'>
              <div className='w-20 h-20 rounded-full bg-linear-to-br from-crimson-600 to-crimson-500 border-4 border-white shadow-lg flex items-center justify-center'>
                <span className='text-white text-xl font-bold'>{getInitials()}</span>
              </div>
            </div>
          </div>

          {/* Profile Info Below Banner */}
          <div className='pt-14 pb-5 px-6'>
            <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3'>
              <div>
                <h2 className='text-xl font-bold text-gray-800'>
                  {`${patientRecord?.first_name ?? ''} ${patientRecord?.last_name ?? ''}`}
                </h2>
                <p className='text-sm text-gray-500 mt-1 flex items-center gap-3 flex-wrap'>
                  <span className='inline-flex items-center gap-1.5'>
                    <IdCard className="w-3.5 h-3.5 text-gray-400" />
                    {studentId ?? '—'}
                  </span>
                  <span className='text-gray-300'>|</span>
                  <span className='inline-flex items-center gap-1.5'>
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    {patientRecord?.department ?? '—'}
                  </span>
                </p>
              </div>
              <div className='flex items-center gap-2 flex-wrap'>
                <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-600 ring-1 ring-gray-100'>
                  <User className="w-3 h-3 text-gray-400" />
                  {patientRecord?.sex ?? '—'}
                </span>
                <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-600 ring-1 ring-gray-100'>
                  <GraduationCap className="w-3 h-3 text-gray-400" />
                  Year {patientRecord?.year_level ?? patientRecord?.year ?? '—'}
                </span>
                {latestDate && (
                  <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-crimson-50 rounded-full text-xs font-medium text-crimson-700 ring-1 ring-crimson-100'>
                    <Clock className="w-3 h-3 text-crimson-500" />
                    Last visit: {latestDate}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact & Details Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {[
            { icon: <Phone className="w-4.5 h-4.5 text-crimson-600" />, label: 'Phone', value: patientRecord?.contact_number },
            { icon: <Mail className="w-4.5 h-4.5 text-crimson-600" />, label: 'Email', value: patientRecord?.email },
            { icon: <MapPin className="w-4.5 h-4.5 text-crimson-600" />, label: 'Address', value: patientRecord?.address },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05, duration: 0.35 }}
              className='bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-5 flex items-center gap-4'
            >
              <div className='w-10 h-10 rounded-xl bg-crimson-50 flex items-center justify-center shrink-0'>
                {item.icon}
              </div>
              <div className='min-w-0'>
                <p className='text-xs text-gray-400 font-medium uppercase tracking-wider'>{item.label}</p>
                <p className='text-sm font-semibold text-gray-800 truncate'>{item.value ?? '—'}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Visit Records Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className='bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden'
        >
          {/* Section Header */}
          <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <h2 className='text-lg font-bold text-gray-800'>Visit Records</h2>
              <span className='inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-crimson-50 text-crimson-700 ring-1 ring-crimson-100'>
                {totalVisits}
              </span>
            </div>
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
              className='inline-flex items-center gap-2 px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-medium rounded-xl transition-colors shadow-sm'
            >
              <Plus className="w-3.5 h-3.5" />
              New Visit
            </button>
          </div>

          {/* Visit List */}
          <div className='p-4'>
            {(!allRecords || allRecords.length === 0) ? (
              <div className='py-16 text-center'>
                <div className='w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center'>
                  <Stethoscope className="w-7 h-7 text-gray-300" />
                </div>
                <p className='text-gray-500 font-medium text-sm'>No visit records yet</p>
                <p className='text-xs text-gray-400 mt-1'>Records will appear here after clinic visits</p>
              </div>
            ) : (
              <div className='flex flex-col gap-2'>
                {allRecords.map((record, idx) => {
                  const firstDiag = record?.diagnoses?.[0];
                  const diagDate = firstDiag?.created_at
                    ? new Date(firstDiag.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : record?.created_at
                    ? new Date(record.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '—';
                  const diagName = firstDiag?.diagnosis || 'No diagnosis';
                  const medication = firstDiag?.medication || '—';
                  const diagCount = record?.diagnoses?.length || 0;

                  return (
                    <motion.button
                      key={record?.id ?? idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.3 }}
                      type='button'
                      className='w-full flex items-center justify-between p-4 rounded-xl hover:bg-crimson-50/40 transition-all text-left group ring-1 ring-transparent hover:ring-crimson-100'
                      onClick={() => handleOpenRecord(record)}
                    >
                      <div className='flex items-start gap-4'>
                        <div className='w-10 h-10 rounded-xl bg-crimson-50 flex items-center justify-center shrink-0 mt-0.5'>
                          <Stethoscope className="w-4.5 h-4.5 text-crimson-600" />
                        </div>
                        <div className='flex-1'>
                          <p className='font-semibold text-gray-800 text-sm group-hover:text-crimson-700 transition-colors'>{diagName}</p>
                          <p className='text-xs text-gray-400 mt-0.5'>{diagDate}</p>
                          <div className='flex gap-4 mt-2 text-xs text-gray-400'>
                            <span className='inline-flex items-center gap-1'>
                              <Pill className="w-3 h-3" />{medication}
                            </span>
                            {diagCount > 1 && (
                              <span className='inline-flex items-center gap-1'>
                                <Layers className="w-3 h-3" />{diagCount} diagnoses
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${
                          record?.status === 'COMPLETE' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-amber-50 text-amber-700 ring-amber-100'
                        }`}>
                          {record?.status ?? '—'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-crimson-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            )}
          </div>
        </motion.div>

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