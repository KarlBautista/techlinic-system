import React, { useEffect, useState, useTransition } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios';
import Back from '../assets/image/back.svg'
import Navigation from '../components/Navigation';
import Phone from '../assets/image/phone.svg'
import Email from '../assets/image/email.svg'
import Calendar from '../assets/image/calendar.svg'
import Building from '../assets/image/department.svg'
import { useNavigate } from 'react-router-dom';
import Patient from "../assets/image/patient.png"
const IndividualRecord = () => {
  const { studentId } = useParams();
  const [ patientRecord, setPatientRecord ] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const navigate = useNavigate();
  console.log(studentId)
  useEffect(() => { 
    const fetchData = async () => {
      try {
         const response = await axios.get(`http://localhost:3000/api/get-record/${studentId}`);
        
         if (response.status !== 200) {
           console.error(`Error getting record: HTTP ${response.status}`);
           return;
         }

          console.log(`ito mga response`, response.data.data);
         setDiagnoses(response.data.data.map((d) => d.diagnoses));
         setPatientRecord(response.data.data[0]);
     
      } catch (err) {
        console.error(`Something went wrong getting record: ${err?.message}`);
        return;
      }
    }
    fetchData();
  }, [studentId]);
  
  console.log("ito mga diagnoses", diagnoses)

  const latestVisit = patientRecord?.diagnoses?.[0]?.created_at ? new Date(patientRecord.diagnoses[0].created_at) : null;

  const latestDate = latestVisit
    ? latestVisit.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;



const handleBack = () => {
  navigate("/patient-record")
}


  return (
    <div className='flex h-full w-full gap-2 '>
      <div className='sm:w-[30%] w-[17%] h-full md:w-[25%] lg:w-[17%] '>
          <Navigation />
      </div>
      <div className='w-[83%]  h-auto flex p-5  flex-col gap-5'>
          <div>
              <h1 className='text-2xl font-bold'>Patient Information</h1>
          </div>
          <section className='w-full h-[50%] border-gray-100 rounded-lg bg-white shadow-lg p-5 flex flex-col justify-center gap-5'>
                  <div className='text-center'>
                      <h2 className='text-2xl font-semibold'>{`${patientRecord?.first_name ?? ''} ${patientRecord?.last_name ?? ''}`}</h2>
                      <p className='text-gray-600'>{`ID : ${studentId ?? '—'}`}</p>
                  </div>
                {/* Kaliwang component */}
              <div className='w-full'>
                <div className='flex flex-col md:flex-row gap-6 mt-4 px-5'>
                  <div className='md:w-1/4 flex items-center justify-center'>
                    <div
                      className=' overflow-hidden'
                      style={{
                        width: '112px',
                        height: '112px',
                        backgroundColor: '#b01c34',
                        WebkitMaskImage: `url(${Patient})`,
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        WebkitMaskSize: 'contain',
                        maskImage: `url(${Patient})`,
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        maskSize: 'contain',
                      }}
                      aria-hidden='true'
                    />
               
                    <img src={Patient} alt={`${patientRecord?.first_name ?? ''} avatar`} className='sr-only' />
                  </div>

                {/* Kanan */}
                  <div className='md:w-3/4'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <h3 className='text-lg font-medium text-gray-800'>{patientRecord?.student_id ?? patientRecord?.id ?? '—'}</h3>
                        <p className='text-sm text-gray-500 mt-1 flex items-center gap-2'>
                          <img src={Building} alt='' className='w-4 h-4 opacity-75' />
                          <span>{patientRecord?.department ?? '—'}</span>
                        </p>
                      </div>
                      <div className='text-sm text-right text-gray-500'>
                        <div className='mt-1'>Last visit: <span className='text-gray-700 font-medium'>{latestDate ?? '—'}</span></div>
                      </div>
                    </div>

                    <dl className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm'>
                      <div>
                        <dt className='text-gray-400'>First name</dt>
                        <dd className='text-gray-800 font-medium'>{patientRecord?.first_name ?? '—'}</dd>
                      </div>

                      <div>
                        <dt className='text-gray-400'>Last name</dt>
                        <dd className='text-gray-800 font-medium'>{patientRecord?.last_name ?? '—'}</dd>
                      </div>

                      <div>
                        <dt className='text-gray-400'>Year level</dt>
                        <dd className='text-gray-800 font-medium'>{patientRecord?.year_level ?? patientRecord?.year ?? '—'}</dd>
                      </div>

                      <div>
                        <dt className='text-gray-400'>Sex</dt>
                        <dd className='text-gray-800 font-medium'>{patientRecord?.sex ??  '—'}</dd>
                      </div>

                      <div>
                        <dt className='text-gray-400'>Contact No.</dt>
                        <dd className='text-gray-800 font-medium'>
                          <div className='flex items-center gap-2'>
                            <img src={Phone} alt='' className='w-4 h-4 opacity-75' />
                            <span>{patientRecord?.contact_number ??  '—'}</span>
                          </div>
                        </dd>
                      </div>

                      <div>
                        <dt className='text-gray-400'>Email</dt>
                        <dd className='text-gray-800 font-medium'>
                          <div className='flex items-center gap-2'>
                            <img src={Email} alt='' className='w-4 h-4 opacity-75' />
                            <span>{patientRecord?.email ?? '—'}</span>
                          </div>
                        </dd>
                      </div>

                      <div className='sm:col-span-2'>
                        <dt className='text-gray-400'>Address</dt>
                        <dd className='text-gray-800 font-medium'>{patientRecord?.address ?? '—'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
             
          </section>

          <div>
            <h1 className='text-2xl font-bold'>Diagnoses</h1>
          </div>

          <section className='w-full border-gray-100 shadow-lg rounded-lg p-2'>
          
            {(!diagnoses || diagnoses.length === 0) ? (
              <div className='p-4 text-gray-500'>No diagnoses recorded.</div>
            ) : (
              <div className='flex flex-col gap-3'>
                {diagnoses.map((d, idx) => {
                  const diagDate = d[0]?.created_at ? new Date(d[0].created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
                  return (
                    <div key={d[0].id ?? idx} className=' rounded-md overflow-hidden'>
                      <button
                        type='button'
                        className='w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100'
                        onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                        aria-expanded={expandedIndex === idx}
                      >
                        <div className='text-left'>
                          <p className='font-medium text-gray-800'>{d[0]?.diagnosis || 'Diagnosis'}</p>
                          <p className='text-sm text-gray-500'>{diagDate}</p>
                        </div>
                        <div className='text-gray-600 text-lg'>{expandedIndex === idx ? '−' : '+'}</div>
                      </button>

                      {expandedIndex === idx && (
                        <div className='p-4 bg-white'>
                          <dl className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                            <div>
                              <dt className='text-gray-400'>Treatment</dt>
                              <dd className='text-gray-800 font-medium'>{d[0]?.treatment ?? '—'}</dd>
                            </div>

                            <div>
                              <dt className='text-gray-400'>Medication</dt>
                              <dd className='text-gray-800 font-medium'>{d[0]?.medication ?? '—'}</dd>
                            </div>

                            <div>
                              <dt className='text-gray-400'>Quantity</dt>
                              <dd className='text-gray-800 font-medium'>{d[0]?.quantity ?? '—'}</dd>
                            </div>

                            <div className='md:col-span-2'>
                              <dt className='text-gray-400'>Additional Notes</dt>
                              <dd className='text-gray-800 font-medium'>{d[0]?.notes ?? d?.additional_notes ?? '—'}</dd>
                            </div>
                          </dl>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
      </div>
    </div>
  )
}

export default IndividualRecord