import React, { useState, useEffect } from 'react'
import Navigation from '../components/newNavigation'
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
     <div className='h-[8%] w-full order-last sm:order-0 sm:w-[20%] sm:h-full md:w-[16%] lg:w-[14%]'>
        <Navigation />
      </div>
      <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[80%] md:w-[84%] lg:w-[86%] overflow-auto p-6 flex flex-col gap-4'>
         {showForm && <MedicineForm medicine={medicineFormData} 
                                    onClose={() => setShowForm(false)} 
                                    onUpdate={(updatedForm) => updateMedicine(updatedForm)}
                                    onDelete={(medicineId) => deleteMedicine(medicineId)}/>}
      
        {initialLoading || isLoading ? (
          <PageLoader message="Loading medicine inventory..." />
        ) : (
        <div className='w-full h-full flex flex-col gap-5'>
          
          <div>
              <h1 className='text-2xl font-bold text-gray-800'>Medicine Inventory</h1>
              <p className='text-sm text-gray-500 mt-1'>Manage medicines and inventory</p>
          </div>

          {/* ─── Search & Add Bar ─── */}
          <div className='flex items-center gap-3 flex-wrap'>
            <div className='flex items-center flex-1 min-w-[200px] max-w-md h-10 px-3 rounded-lg bg-white ring-1 ring-gray-200 focus-within:ring-[#b01c34] transition-all'>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input type="text" className='outline-none w-full ml-2 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent' placeholder='Search medicines...' />
            </div>

            <button
              onClick={() => handleAddMedicine()}
              className='inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#b01c34] text-white text-sm font-medium hover:bg-[#8f1629] transition-colors shadow-sm cursor-pointer'
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Medicine
            </button>

            {medicines && (
              <span className='text-xs text-gray-400 font-medium ml-auto'>
                {medicines.length} item{medicines.length !== 1 ? 's' : ''} in stock
              </span>
            )}
          </div>

          {/* ─── Table Card ─── */}
          <div className='bg-white rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden'>
            <div className='overflow-auto flex-1'>
              <table className='w-full'>
                <thead className='sticky top-0 bg-gray-50/90 backdrop-blur-sm'>
                  <tr>
                    <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Medicine Name</th>
                    <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell'>Generic Name</th>
                    <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell'>Brand</th>
                    <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell'>Type</th>
                    <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell'>Dosage</th>
                    <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Stock</th>
                    <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell'>Batch #</th>
                    <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell'>Expiry</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-50'>
                  {medicines && medicines.length > 0 ? (
                    medicines.map((medicine) => (
                      <tr
                        key={medicine.id}
                        className='hover:bg-gray-50/60 cursor-pointer transition-colors group'
                        onClick={() => handleUpdateMedicine(medicine)}
                      >
                        <td className='px-5 py-3.5'>
                          <span className='text-sm font-medium text-gray-900 group-hover:text-[#b01c34] transition-colors'>
                            {medicine.medicine_name}
                          </span>
                        </td>
                        <td className='px-5 py-3.5 hidden sm:table-cell'>
                          <span className='text-sm text-gray-600'>{medicine.generic_name}</span>
                        </td>
                        <td className='px-5 py-3.5 hidden lg:table-cell'>
                          <span className='text-sm text-gray-600'>{medicine.brand}</span>
                        </td>
                        <td className='px-5 py-3.5 hidden md:table-cell'>
                          <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
                            {medicine.type}
                          </span>
                        </td>
                        <td className='px-5 py-3.5 hidden lg:table-cell'>
                          <span className='text-sm text-gray-600'>{medicine.dosage} {medicine.unit_of_measure}</span>
                        </td>
                        <td className='px-5 py-3.5'>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            medicine.stock_level <= 10
                              ? 'bg-red-50 text-red-700'
                              : medicine.stock_level <= 50
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {medicine.stock_level}
                          </span>
                        </td>
                        <td className='px-5 py-3.5 hidden md:table-cell'>
                          <span className='text-sm text-gray-500'>{medicine.batch_number}</span>
                        </td>
                        <td className='px-5 py-3.5 hidden sm:table-cell'>
                          <span className='text-sm text-gray-500'>{formatDate(medicine.expiry_date)}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className='px-5 py-16 text-center'>
                        <div className='flex flex-col items-center text-gray-400'>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m20.893 13.393-1.135-1.135a2.252 2.252 0 0 1-.421-.585l-1.08-2.16a.414.414 0 0 0-.663-.107.827.827 0 0 1-.812.21l-1.273-.363a.89.89 0 0 0-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 0 1-1.81 1.025 1.055 1.055 0 0 1-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 0 1-1.383-2.46l.007-.042a2.25 2.25 0 0 1 .29-.787l.09-.15a2.25 2.25 0 0 1 2.37-1.048l1.178.236a1.125 1.125 0 0 0 1.302-.795l.208-.73a1.125 1.125 0 0 0-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 0 1-1.591.659h-.18a.94.94 0 0 0-.662.274.931.931 0 0 1-1.458-1.137l1.411-2.353a2.25 2.25 0 0 0 .286-.76m11.928 9.869A9 9 0 0 0 8.965 3.525m11.928 9.868A9 9 0 1 1 8.965 3.525" />
                          </svg>
                          <p className='text-sm font-medium text-gray-500'>No medicines in inventory</p>
                          <p className='text-xs text-gray-400 mt-1'>Add medicines to get started</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
        )}
      </div>
    </div>
  )
}

export default MedicineInventory
