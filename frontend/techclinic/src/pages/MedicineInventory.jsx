import React from 'react'
import Navigation from '../components/Navigation'
const MedicineInventory = () => {
  return (
     <div className='flex h-full w-full gap-2'>
     <div className='w-[17%] h-full'>
        <Navigation />
      </div>
      <div className='p-5'>
        Medicine Inventory
      </div>
    </div>
  )
}

export default MedicineInventory
