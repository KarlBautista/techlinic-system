import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api';
import Navigation from '../components/newNavigation';
import Phone from '../assets/image/phone.svg'
import Email from '../assets/image/email.svg'
import Building from '../assets/image/department.svg'
import { useNavigate } from 'react-router-dom';
import Patient from "../assets/image/patient.png"
import DiagnosisModal from '../components/DiagnosisModal'
import { PageLoader } from '../components/PageLoader'

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
    <div className='h-screen w-full flex flex-col sm:flex-row'>
      <div className='h-[8%] w-full order-last sm:order-0 sm:w-[20%] sm:h-full md:w-[16%] lg:w-[14%]'>
          <Navigation />
      </div>
        <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[80%] md:w-[84%] lg:w-[86%] overflow-auto p-6 flex flex-col gap-4'>

        {isLoading ? (
          <PageLoader message="Loading patient record..." />
        ) : (
        <>
        {/* Header with back button */}
        <div className='flex items-center gap-3'>
          <button 
            onClick={() => navigate(-1)} 
            className='w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm'
          >
            <i className='fa-solid fa-arrow-left text-gray-600 text-sm'></i>
          </button>
          <div>
            <h1 className='text-2xl font-bold text-gray-800'>Patient Record</h1>
            <p className='text-sm text-gray-500 mt-0.5'>View patient details and visit history</p>
          </div>
        </div>

        {/* Profile Banner Card */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
          {/* Gradient Banner */}
          <div className='h-28 bg-linear-to-r from-[#b01c34] to-[#d4375a] relative'>
            <div className='absolute -bottom-10 left-6'>
              <div className='w-20 h-20 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center'>
                <div
                  className='w-full h-full rounded-full overflow-hidden'
                  style={{
                    backgroundColor: '#b01c34',
                    WebkitMaskImage: `url(${Patient})`,
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    WebkitMaskSize: '70%',
                    maskImage: `url(${Patient})`,
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    maskSize: '70%',
                  }}
                  aria-hidden='true'
                />
              </div>
            </div>
          </div>

          {/* Profile Info Below Banner */}
          <div className='pt-14 pb-5 px-6'>
            <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2'>
              <div>
                <h2 className='text-xl font-bold text-gray-800'>
                  {`${patientRecord?.first_name ?? ''} ${patientRecord?.last_name ?? ''}`}
                </h2>
                <p className='text-sm text-gray-500 mt-0.5 flex items-center gap-3'>
                  <span className='inline-flex items-center gap-1.5'>
                    <i className='fa-solid fa-id-card text-gray-400 text-xs'></i>
                    {studentId ?? '—'}
                  </span>
                  <span className='text-gray-300'>|</span>
                  <span className='inline-flex items-center gap-1.5'>
                    <img src={Building} alt='' className='w-3.5 h-3.5 opacity-60' />
                    {patientRecord?.department ?? '—'}
                  </span>
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600'>
                  <i className='fa-solid fa-venus-mars text-gray-400'></i>
                  {patientRecord?.sex ?? '—'}
                </span>
                <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600'>
                  <i className='fa-solid fa-graduation-cap text-gray-400'></i>
                  Year {patientRecord?.year_level ?? patientRecord?.year ?? '—'}
                </span>
                {latestDate && (
                  <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-[#b01c34]/10 rounded-full text-xs font-medium text-[#b01c34]'>
                    <i className='fa-solid fa-clock text-[#b01c34]/60'></i>
                    Last visit: {latestDate}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Details Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4'>
            <div className='w-10 h-10 rounded-lg bg-[#b01c34]/10 flex items-center justify-center shrink-0'>
              <img src={Phone} alt='' className='w-5 h-5' style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(80%) saturate(4000%) hue-rotate(340deg)' }} />
            </div>
            <div className='min-w-0'>
              <p className='text-xs text-gray-400 font-medium uppercase tracking-wider'>Phone</p>
              <p className='text-sm font-semibold text-gray-800 truncate'>{patientRecord?.contact_number ?? '—'}</p>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4'>
            <div className='w-10 h-10 rounded-lg bg-[#b01c34]/10 flex items-center justify-center shrink-0'>
              <img src={Email} alt='' className='w-5 h-5' style={{ filter: 'brightness(0) saturate(100%) invert(15%) sepia(80%) saturate(4000%) hue-rotate(340deg)' }} />
            </div>
            <div className='min-w-0'>
              <p className='text-xs text-gray-400 font-medium uppercase tracking-wider'>Email</p>
              <p className='text-sm font-semibold text-gray-800 truncate'>{patientRecord?.email ?? '—'}</p>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4'>
            <div className='w-10 h-10 rounded-lg bg-[#b01c34]/10 flex items-center justify-center shrink-0'>
              <i className='fa-solid fa-location-dot text-[#b01c34]'></i>
            </div>
            <div className='min-w-0'>
              <p className='text-xs text-gray-400 font-medium uppercase tracking-wider'>Address</p>
              <p className='text-sm font-semibold text-gray-800 truncate'>{patientRecord?.address ?? '—'}</p>
            </div>
          </div>
        </div>

        {/* Visit Records Section */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
          {/* Section Header */}
          <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <h2 className='text-lg font-bold text-gray-800'>Visit Records</h2>
              <span className='inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#b01c34]/10 text-[#b01c34]'>
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
              className='inline-flex items-center gap-2 px-3 py-1.5 bg-[#b01c34] hover:bg-[#8f1629] text-white text-xs font-medium rounded-lg transition-colors'
            >
              <i className='fa-solid fa-plus text-[10px]'></i>
              New Visit
            </button>
          </div>

          {/* Visit List */}
          <div className='p-4'>
            {(!allRecords || allRecords.length === 0) ? (
              <div className='py-12 text-center'>
                <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center'>
                  <i className='fa-solid fa-clipboard-list text-2xl text-gray-300'></i>
                </div>
                <p className='text-gray-500 font-medium'>No visit records yet</p>
                <p className='text-sm text-gray-400 mt-1'>Records will appear here after clinic visits</p>
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
                    <button
                      key={record?.id ?? idx}
                      type='button'
                      className='w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-all text-left group border border-transparent hover:border-gray-200'
                      onClick={() => handleOpenRecord(record)}
                    >
                      <div className='flex items-start gap-4'>
                        <div className='w-10 h-10 rounded-lg bg-[#b01c34]/10 flex items-center justify-center shrink-0 mt-0.5'>
                          <i className='fa-solid fa-stethoscope text-[#b01c34] text-sm'></i>
                        </div>
                        <div className='flex-1'>
                          <p className='font-semibold text-gray-800 text-sm group-hover:text-[#b01c34] transition-colors'>{diagName}</p>
                          <p className='text-xs text-gray-400 mt-0.5'>{diagDate}</p>
                          <div className='flex gap-4 mt-2 text-xs text-gray-400'>
                            <span className='inline-flex items-center gap-1'>
                              <i className='fa-solid fa-pills text-[10px]'></i>{medication}
                            </span>
                            {diagCount > 1 && (
                              <span className='inline-flex items-center gap-1'>
                                <i className='fa-solid fa-layer-group text-[10px]'></i>{diagCount} diagnoses
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                          record?.status === 'COMPLETE' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {record?.status ?? '—'}
                        </span>
                        <i className='fa-solid fa-chevron-right text-gray-300 text-xs group-hover:text-[#b01c34] transition-colors'></i>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </>
      )}
      </div>
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