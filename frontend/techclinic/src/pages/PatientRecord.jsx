import React from 'react'
import Navigation from '../components/Navigation'
const PatientRecord = () => {
  return (
    <div className='flex h-full w-full gap-2'>
       
       {/* for navigation */}
        <div className='sm:w-[30%] w-[17%] h-full md:w-[25%] lg:w-[20%]'> 
          <Navigation />
        </div>
        

        <div className='p-5'>
          Patient Record
        </div>
    </div>
  )
}

export default PatientRecord
