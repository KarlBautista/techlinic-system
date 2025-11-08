import React from 'react'
import Navigation from '../components/Navigation'
const PatientRecord = () => {
  return (
    <div className='flex h-full w-full gap-2'>
     <div className='w-[17%] h-full'>
        <Navigation />
      </div>
      <div className='p-5'>
        Patient Record
      </div>
    </div>
  )
}

export default PatientRecord
