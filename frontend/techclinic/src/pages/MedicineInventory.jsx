import React from 'react'
import Search from '../assets/image/searcg.svg'
import Navigation from '../components/Navigation'
import Medicine from '../assets/image/medicine.svg'
import { useNavigate } from 'react-router-dom'
import useMedicine from '../store/useMedicineStore'
const MedicineInventory = () => {
  const { medicines } = useMedicine();
  const navigate = useNavigate();
  console.log("mga medicines", medicines);
  const handleAddMedicine = () => {
    navigate("/add-medicine");
  }
  function formatDate(dateString) {
    if (!dateString) return "";

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
}


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

              <div id='addMedicine' className='flex h-[50px]  p-2 rounded-[10px] bg-[#A12217] gap-2 w-[20%] items-cenrter justify-center cursor-pointer'
              onClick={() => handleAddMedicine()}>
                  <img src={Medicine} alt="" />
                  <button className='text-white text-[.9rem]'>Add Medicine</button>
              </div>
          </div>
             <div className='w-[90%] overflow-x-auto mt-4'>
            <table className='min-w-full border border-gray-200  rounded-lg overflow-hidden text-left'>
              <thead className='bg-[#C41E3A]'>
                <tr>
                  <th className='px-4 py-2 border-b text-white'>Medicine Name</th>
                  <th className='px-4 py-2 border-b text-white'>Generic Name</th>
                  <th className='px-4 py-2 border-b text-white'>Brand / Manufacturer</th>
                  <th className='px-4 py-2 border-b text-white'>Type / Form</th>
                  <th className='px-4 py-2 border-b text-white'>Dosage</th>
                  <th className='px-4 py-2 border-b text-white'>Unit of Measure</th>
                  <th className='px-4 py-2 border-b text-white'>Stock Level</th>
                  <th className='px-4 py-2 border-b text-white'>Batch Number</th>
                  <th className='px-4 py-2 border-b text-white'>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
           {medicines && medicines.length > 0 ? 
             ( medicines.map((medicine) => {
              return <tr className='odd:bg-white even:bg-gray-50 hover:bg-gray-100'>
                <td className='px-4 py-2 border-b'>{medicine.medicine_name}</td>
                <td className='px-4 py-2 border-b'>{medicine.generic_name}</td>
                <td className='px-4 py-2 border-b'>{medicine.brand}</td>
                <td className='px-4 py-2 border-b'>{medicine.type}</td>
                <td className='px-4 py-2 border-b'>{medicine.dosage}</td>
                <td className='px-4 py-2 border-b'>{medicine.unit_of_measure}</td>
                <td className='px-4 py-2 border-b'>{medicine.stock_level}</td>
                <td className='px-4 py-2 border-b'>{medicine.batch_number}</td>
                <td className='px-4 py-2 border-b'>{formatDate(medicine.expiry_date)}</td>
            </tr>
             })
           
             ) : null
            }
             
              </tbody>
            </table>
          </div>
          

        </div>
      </div>
    </div>
  )
}

export default MedicineInventory
