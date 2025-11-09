import React from 'react'
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
        

        <div className='p-5'>
          Patient Record
        </div>
    </div>
  )
}

export default PatientRecord
