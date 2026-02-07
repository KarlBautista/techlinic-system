import React, { useState, useEffect } from 'react'
import Search from '../assets/image/searcg.svg'
import Navigation from '../components/newNavigation'
import Medicine from '../assets/image/medicine.svg'
import { useNavigate } from 'react-router-dom'
import useMedicine from '../store/useMedicineStore'
import MedicineForm from '../components/MedicineForm'
import { PageLoader } from '../components/PageLoader'

const MedicineInventory = () => {
  const { medicines, updateMedicine, deleteMedicine, getMedicines, isLoading } = useMedicine();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [medicineFormData, setMedicineFormData] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
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

  const handleUpdateMedicine = (medicine) => {
    setShowForm(!showForm);
    setMedicineFormData(medicine)
  }

  // Auto-refresh inventory every 30 seconds
  useEffect(() => {
    // Fetch on mount
    const fetchInitial = async () => {
      await getMedicines();
      setInitialLoading(false);
    };
    fetchInitial();

    const interval = setInterval(() => {
      getMedicines();
    }, 15000);
    return () => clearInterval(interval);
  }, [getMedicines]);

  return (
    
     <div className='h-screen w-full flex flex-col sm:flex-row'>
     <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%]'>
        <Navigation />
      </div>
      <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-6 flex flex-col gap-4'>
         {showForm && <MedicineForm medicine={medicineFormData} 
                                    onClose={() => setShowForm(false)} 
                                    onUpdate={(updatedForm) => updateMedicine(updatedForm)}
                                    onDelete={(medicineId) => deleteMedicine(medicineId)}/>}
      
        {initialLoading || isLoading ? (
          <PageLoader message="Loading medicine inventory..." />
        ) : (
        <div className='w-full h-full flex flex-col items-center gap-5 '  >
          
          <div className='w-full flex flex-col gap-2'>
              <h1 className='text-2xl font-bold text-gray-800'>Medicine Inventory</h1>
              <p className='text-sm text-gray-500 mt-1'>Manage medicines and inventory</p>
              
          </div>

          <div className='w-[90%] flex justify-between'>
              <div className='flex h-[50px]  p-2 rounded-[10px] border border-[#EACBCB] gap-2 w-[70%]' >
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
            <table className='min-w-full rounded-lg overflow-hidden text-left'>
              <thead className='bg-[#C41E3A]'>
                <tr>
                  <th className='px-4 py-3 text-white text-sm font-semibold'>Medicine Name</th>
                  <th className='px-4 py-3 text-white text-sm font-semibold'>Generic Name</th>
                  <th className='px-4 py-3 text-white text-sm font-semibold'>Brand / Manufacturer</th>
                  <th className='px-4 py-3 text-white text-sm font-semibold'>Type / Form</th>
                  <th className='px-4 py-3 text-white text-sm font-semibold'>Dosage</th>
                  <th className='px-4 py-3 text-white text-sm font-semibold'>Unit of Measure</th>
                  <th className='px-4 py-3 text-white text-sm font-semibold'>Stock Level</th>
                  <th className='px-4 py-3 text-white text-sm font-semibold'>Batch Number</th>
                  <th className='px-4 py-3 text-white text-sm font-semibold'>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
           {medicines && medicines.length > 0 ? 
             ( medicines.map((medicine) => {
              return <tr key={medicine.id} className='odd:bg-white even:bg-gray-50 hover:bg-gray-100' onClick={() => handleUpdateMedicine(medicine)}>
                <td className='px-4 py-3 text-sm text-gray-700'>{medicine.medicine_name}</td>
                <td className='px-4 py-3 text-sm text-gray-700'>{medicine.generic_name}</td>
                <td className='px-4 py-3 text-sm text-gray-700'>{medicine.brand}</td>
                <td className='px-4 py-3 text-sm text-gray-700'>{medicine.type}</td>
                <td className='px-4 py-3 text-sm text-gray-700'>{medicine.dosage}</td>
                <td className='px-4 py-3 text-sm text-gray-700'>{medicine.unit_of_measure}</td>
                <td className='px-4 py-3 text-sm text-gray-700'>{medicine.stock_level}</td>
                <td className='px-4 py-3 text-sm text-gray-700'>{medicine.batch_number}</td>
                <td className='px-4 py-3 text-sm text-gray-700'>{formatDate(medicine.expiry_date)}</td>
             
            </tr>
         
             })
           
             ) : null
            }
             
              </tbody>
            </table>
          </div>
          

        </div>
        )}
      </div>
    </div>
  )
}

export default MedicineInventory
