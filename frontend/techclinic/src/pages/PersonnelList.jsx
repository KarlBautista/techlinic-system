import React from 'react'
import Navigation from '../components/newNavigation'
import Receipt from '../components/Receipt'
const PersonnelList = () => {
  return (
    <div className='flex h-full w-full gap-2 overflow-y-auto'>
      <div className='sm:w-[30%] w-[17%] h-full md:w-[25%] lg:w-[17%]  sticky top-0 '>
          <Navigation />
      </div>
        <div className='h-[92%] min-w-[360px] sm:min-w-0  w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-2 flex flex-col gap-2'>
            <h1 className='text-3xl font-semibold text-gray-800'>Personnel List</h1>
             <Receipt />
        </div>

       
    </div>
  )
}

export default PersonnelList
