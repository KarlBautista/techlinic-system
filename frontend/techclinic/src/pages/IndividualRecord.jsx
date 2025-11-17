import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios';
import User from '../assets/image/user.svg'
import Back from '../assets/image/back.svg'
import Navigation from '../components/Navigation';
import Phone from '../assets/image/phone.svg'
import Email from '../assets/image/email.svg'
import Calendar from '../assets/image/calendar.svg'
import Building from '../assets/image/department.svg'
import { useNavigate } from 'react-router-dom';
const IndividualRecord = () => {
  const { patientId } = useParams();
  const [ patientRecord, setPatientRecord ] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
         const response = await axios.get(`http://localhost:3000/api/get-record/${patientId}`);
        
         if (response.status !== 200) {
           console.error(`Error getting record: HTTP ${response.status}`);
           return;
         }


         setPatientRecord(response.data.data[0]);
      } catch (err) {
        console.error(`Something went wrong getting record: ${err?.message}`);
        return;
      }
    }
    fetchData();
  }, [patientId]);



  const createdAt = new Date(patientRecord.created_at);
  const latestVisit = new Date(patientRecord.diagnoses?.[0]?.created_at);
  

const latestDate = latestVisit.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric"
});
  

const formattedDate = createdAt.toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",  
  day: "numeric"
});

const handleBack = () => {
  navigate("/patient-record")
}


  return (
    <div className='flex h-full w-full gap-2 '>
      <div className='sm:w-[30%] w-[17%] h-full md:w-[25%] lg:w-[17%] '>
          <Navigation />
      </div>
      <div className='w-[83%]  h-full flex justify-center p-5'>
          <div className='w-full h-full flex flex-col items-center'  >
                  <div className='w-full flex h-[15%] justify-evenly gap-2'>
                    <div className='w-[20%]'>
                        <div className='w-full h-full flex items-center gap-2'>
                          <img src={Back} alt=""  className='h-[15%]'/>
                          <p className='text-[.8rem] cursor-pointer' onClick={() => handleBack()}>back to patient record</p>
                        </div>
                    </div>
                    <div className='w-[30%] flex '>
                      <div className='h-full w-[25%] flex justify-center items-center'>
                          <div className='h-[70px] w-[70px] rounded-full border-1  border-[red] flex items-center justify-center bg-red-100'>
                              <p className='text-[2rem] font-bold'>KB</p>
                          </div>
                      </div>
                      <div className='h-full w-[85%] ml-2 flex flex-col justify-center'>
                        <p className='text-[1.3rem] font-bold text-gray-900'>{`${patientRecord.first_name} ${patientRecord.last_name}`}</p>
                        <p className='text-[.8rem]'>{patientRecord.student_id}</p>
                      </div>
                    </div>
                    <div className='w-[20%] flex items-center justify-center'>
                      <button className='w-[60%] p-2  rounded-[10px] bg-[#ff6260] text-white text-[.8rem]'>Update Patient</button>
                    </div>
                  </div>

                  <div className='w-full h-[85%] flex flex-col '>
                      <div className='h-[60%] w-full flex items-center justify-center gap-10'> 
                          <div className='h-full w-[35%] border-2 border-[#eddcdc] flex flex-col rounded-[15px]'>
                              <div className='h-[40%] flex flex-col gap-4 '>
                                <div className='w-full h-[30%] flex gap-2 p-2 items-center'>
                                  <img src={User} className='h-[20px]' alt="" />
                                  <p className='font-medium text-[#A12217] text-[.8rem]'>Demographics</p>
                                </div>

                                <div className='h-[70%] w-full'>
                                  <div className='flex justify-between p-2'>
                                    <p className='text-[#a9a9a9] text-[.9rem]'>Age</p>
                                    <p className='font-medium text-[.9rem]'>21 years old</p>
                                  </div>
                                  <div className='flex justify-between p-2'>
                                    <p className='text-[#a9a9a9] text-[.9rem]'>Gender</p>
                                    <p className='font-medium text-[.9rem]'>Male</p>
                                  </div>
                                  <div className='w-full border-1 border-[#a9a9a9]'></div>
                                </div>
                              </div>
                              <div className='h-[60%] p-3 flex flex-col gap-7 '>
                                  <div className='flex gap-2'>
                                    <img src={Phone} className='h-[20px]' alt="" />
                                    <p className='text-[.9rem]'>
                                      {patientRecord.contact_number}
                                    </p>
                                  </div>
                                  <div className='flex gap-2'>
                                    <img src={Email} className='h-[20px]' alt="" />
                                    <p className='text-[.9rem]'>
                                      {patientRecord.email}
                                    </p>
                                  </div>
                                  <div className='flex gap-2'>
                                    <img src={Building} className='h-[20px]' alt="" />
                                    <p className='text-[.9rem]'>
                                      {patientRecord.department}
                                    </p>
                                  </div>
                                  <div className='flex gap-2'>
                                    <img src={Calendar} className='h-[20px]' alt="" />
                                    <p className='text-[.9rem]'>
                                      {`Last visit: ${formattedDate}`}
                                    </p>
                                  </div>
                              </div>
                          </div>
                          <div className='h-full w-[35%]  border-2 border-[#eddcdc] rounded-[15px]'>
                               <div className='h-[40%] flex flex-col gap-4'>
                                <div className='w-full h-[30%] flex gap-2 p-2 items-center '>
                                  <img src={User} className='h-[20px]' alt="" />
                                  <p className='font-medium text-[#A12217] text-[.8rem]'>Demographics</p>
                                </div>
                                <div className='w-full h-[70%] flex flex-col gap-2 p-2'>
                                    <div className='flex flex-col'>
                                      <p className='text-[.9rem] text-[#a9a9a9]'>
                                        Diagnosis
                                      </p>
                                      <p className='text-[.9rem] font-medium'>
                                        {`Last visit: ${patientRecord.diagnoses?.[0]?.diagnosis}`}
                                      </p>
                                    </div>

                                    <div className='flex flex-col'>
                                      <p className='text-[.9rem] text-[#a9a9a9]'>
                                        Medication
                                      </p>
                                      <p className='text-[.9rem] font-medium'>
                                        {`Last visit: ${patientRecord.diagnoses?.[0]?.medication}`}
                                      </p>
                                    </div>

                                    <div className='flex flex-col'>
                                      <p className='text-[.9rem] text-[#a9a9a9]'>
                                        Attending Physician
                                      </p>
                                      <p className='text-[.9rem] font-medium'>
                                        {`Last visit: ${patientRecord.attending_physician}`}
                                      </p>
                                    </div>

                                    <div className='flex flex-col'>
                                      <p className='text-[.9rem] text-[#a9a9a9]'>
                                        Date of Visit
                                      </p>
                                      <p className='text-[.9rem] font-medium'>
                                        {`Last visit: ${latestDate}`}
                                      </p>
                                    </div>
                                </div>
                              </div>
                          </div>
                      </div>
                    <div className='h-[40%] flex items-center justify-center '>
                          <div className='w-[80%] h-full overflow-y-auto'>
                              <div className='h-[50px] font-medium p-3 flex items-center justify-between w-full border-1 rounded-[10px] mt-3'>
                                    <p>{latestDate}</p>
                                    <p>{patientRecord.diagnoses?.[0]?.diagnosis}</p>
                              </div>
                          </div>
                    </div>
                  </div>
          </div>
      </div>
    </div>
  )
}

export default IndividualRecord