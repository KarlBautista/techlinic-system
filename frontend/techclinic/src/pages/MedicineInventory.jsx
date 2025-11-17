import React from 'react'
import Search from '../assets/image/searcg.svg'
import Navigation from '../components/Navigation'
import Medicine from '../assets/image/medicine.svg'
const MedicineInventory = () => {
  return (
     <div className='flex h-full w-full gap-2'>
     <div className='w-[17%] h-full'>
        <Navigation />
      </div>
      <div className='w-[83%]  h-full flex justify-center p-5 '>
        <div className='w-full h-full flex flex-col items-center gap-5 '  >
          
          <div className='w-full flex flex-col gap-2'>
              <p className='text-[1.5rem] font-semibold text-gray-900'>Medicine Inventory</p>
              <p className='text-[1rem] text-gray-500'>Manage Medicines</p>
          </div>

          <div className='w-[90%] flex justify-between'>
              <div className='flex h-[50px]  p-2 rounded-[10px] border-1 border-[#EACBCB] gap-2 w-[70%]' >
                <img src={Search} alt="" className='h-full'/>
                <input type="text" className='outline-none w-full'  placeholder='Search'/>
              </div>

              <div id='addMedicine' className='flex h-[50px]  p-2 rounded-[10px] bg-[#A12217] gap-2 w-[20%] items-cenrter justify-center'>
                  <img src={Medicine} alt="" />
                  <button className='text-white text-[.9rem]'>Add Medicine</button>
              </div>
          </div>

          <div className='w-[80%] h-[550px]'>
                <div className='medicineContainer'>
                    <div className='info'>
                      <div className='infoName'>Medicine Name</div>
                      <div className='medicineInfo'>Biogesic</div>
                    </div>
                    <div className='info'>
                      <div className='infoName'>Dosage</div>
                      <div className=' medicineInfo'>500 mg</div>
                    </div>
                    <div className='info'>
                      <div className='infoName'>Unit</div>
                      <div className=' medicineInfo'>Tablet</div>
                    </div>
                    <div className='info'>
                      <div className='infoName'>Stock</div>
                      <div className=' medicineInfo'>21</div>
                    </div>
                    <div className='info'>
                      <div className='infoName'>Status</div>
                      <div className=' medicineInfo'>
                        <div className='h-[20px] w-[20px] rounded-full bg-yellow-500'>
                        </div>
                      </div>
                    </div>
                </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default MedicineInventory
