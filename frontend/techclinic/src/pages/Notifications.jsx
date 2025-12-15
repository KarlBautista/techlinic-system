import React from 'react'
import Navigation from '../components/newNavigation'

const Notifications = () => {
  return (
     <div className='h-screen w-full flex flex-col sm:flex-row'>
          <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%]'>
              <Navigation />
          </div>
        <div className='h-[92%] min-w-[360px] sm:min-w-0  w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-2 flex flex-col gap-2'>
            <div className='w-full h-full flex flex-col items-center gap-5 scrollbar'  >
                <div className='w-full flex flex-col gap-2'>
                    <p className='text-[1.5rem] font-semibold text-gray-900'>Notifications</p>
                </div>
              
                <div className='w-[90%] h-full overflow-y-auto '>
                    <div className=' border border-gray-200  p-2  rounded-[10px]  h-[60px] mt-2 w-full flex flex-col'>
                        <div className='h-[40%] w-full flex text-[1rem] font-bold items-center'>
                            <p>Title</p>
                        </div>
                        <div className='h-[60%] w-full flex justify-between -[.9rem] items-center p-1'>
                            <p>Message</p>
                            <p>Date</p>
                        </div>
                    </div>
                    
                    
                </div>
            </div>
        </div>
      </div>
  )
}

export default Notifications
