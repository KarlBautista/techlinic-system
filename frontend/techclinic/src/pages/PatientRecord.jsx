import React from 'react'
import Search from '../assets/image/searcg.svg'
import Printer from '../assets/image/printer.svg'
import Navigation from '../components/Navigation'
import useData from '../store/useDataStore'
const PatientRecord = () => {
  {/*automatic na na gaganaa yung getRecord after mag success yung login ng doctor*/}
  {/*May data na tong patientRecords (array of object na may diagnosis object pa sa loob)*/}
  {/*npm run dev muna sa backend folder para gumana*/}
  const { patientRecords } = useData();
  console.log("ito lahat ng patient records", patientRecords);
  return (
    <div className='flex h-full w-full gap-2'>
       
       {/* for navigation */}
        <div className='sm:w-[30%] w-[17%] h-full md:w-[25%] lg:w-[17%]'> 
          <Navigation />
        </div>
        

        <div className='w-[83%]  h-full flex justify-center p-5'>
            <div className='w-full h-full flex flex-col items-center gap-5 scrollbar'  >
                <div className='w-full flex flex-col gap-2'>
                    <p className='text-[1.5rem] font-semibold text-gray-900'>Patient Record</p>
                    <p className='text-[1rem] text-gray-500'>Manage patient information and medical records</p>
                </div>
                <div className='w-[90%] flex justify-between '>
                    <div className='flex h-[50px]  p-2 rounded-[10px] border-1 border-[#EACBCB] gap-2 w-[50%]' >
                      <img src={Search} alt="" className='h-full'/>
                      <input type="text" className='outline-none w-full'  placeholder='Search'/>
                    </div>

                    <div className='w-[25%] border-1  h-[50px] border-[#EACBCB] p-2 rounded-[10px]'>
                      <select id="department" name="department"  className='w-full h-full rounded-[10px] outline-none'>
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

                <div className=' h-[40px] w-[90%] flex gap-2 mt-[20px]'>
                    <div className='h-full w-full flex items-center font-medium'>
                      <p className='text-[.9remrem] tracking-[2px]'>Student ID</p>
                    </div>
                    <div className='h-full w-full flex items-center font-medium'>
                      <p className='text-[.9remrem] tracking-[2px]'>Name</p>
                    </div>
                    <div className='h-full w-full flex items-center font-medium'>
                      <p className='text-[.9remrem] tracking-[2px]'>Department</p>
                    </div>
                    <div className='h-full w-full flex items-center font-medium'>
                      <p className='text-[.9remrem] tracking-[2px]'>Diagnosis</p>
                    </div>
                </div>

                {/* CREATE A DIV PARA SA RECORD // EACH STUDENT MAGKAKAROON NG DIV */}

                <div className='w-[90%] h-full overflow-y-auto'>
                 {/* Each Student create ng div na may class na studentCss */}
                  <div className=' studentCss'>  
                    {/* After nun gawa ka ng apat na div sa loob na may css na StudentInfoContainer */}
                      <div className='studentInfoContainer'>
                        {/* After nun gawa ka ng p na may css na studentInfoData */}
                        <p className='studentInfoData'>TUPM-22-2170</p>
                      </div>
                      <div className='studentInfoContainer'>
                        <p className='studentInfoData'>Richmon Jay Francisco</p>
                      </div>
                      <div className='studentInfoContainer'>
                        <p className='studentInfoData'>College of Science</p>
                      </div>
                      <div className='studentInfoContainer'>
                        <p className='studentInfoData'>Big foot</p>
                      </div>
                  </div>     
                </div>
            </div>
        </div>
    </div>
  )
}

export default PatientRecord
