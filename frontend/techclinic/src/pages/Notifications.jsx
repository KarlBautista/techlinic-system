import React from 'react'
import Navigation from '../components/Navigation'

const Notifications = () => {
  return (
     <div className='flex h-full w-full gap-2 overflow-y-auto'>
        <div className='sm:w-[30%] w-[17%] h-full md:w-[25%] lg:w-[17%]  sticky top-0 '>
            <Navigation />
        </div >
        <div className='p-5 w-[83%] h-full flex flex-col gap-5'>
            <div className='w-full flex flex-col gap-2'>
            <h2 className='text-2xl font-semibold text-gray-900'>Notifications</h2>
    
        </div>
        </div>
      </div>
  )
}

export default Notifications
