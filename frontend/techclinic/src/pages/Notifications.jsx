import React from 'react'
import Navigation from '../components/newNavigation'

const Notifications = () => {
  return (
     <div className='h-screen w-full flex flex-col sm:flex-row'>
        <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%]'>
            <Navigation />
        </div >
        <div className='h-[92%] min-w-[360px] sm:min-w-0  w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-2 flex flex-col gap-2'>
            <div className='w-full flex flex-col gap-2'>
            <h2 className='text-2xl font-semibold text-gray-900'>Notifications</h2>
    
        </div>
        </div>  
      </div>
  )
}

export default Notifications
