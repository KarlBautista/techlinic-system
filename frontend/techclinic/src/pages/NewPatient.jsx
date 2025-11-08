import React from 'react'
import Navigation from '../components/Navigation'
const NewPatient = () => {
  return (
     <div className='flex h-full w-full gap-2'>
      <div className='w-[17%] h-full'>
        <Navigation />
      </div>
   
      <div className='p-5'>
        New Paiient
      </div>
    </div>
  )
}

export default NewPatient
