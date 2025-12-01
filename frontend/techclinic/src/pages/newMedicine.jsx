import Navigation from '../components/newNavigation.jsx'
import Search from '../assets/image/searcg.svg'
import Medicine from '../assets/componentImage/addMedicine.svg'
import '../componentCss/newMedicine.css'
import MedicineForm from '../components/MedicineForm.jsx'

import React, { useState } from 'react'


import { useNavigate } from 'react-router-dom'
import useMedicine from '../store/useMedicineStore'


const newMedicine =()=> {

    const { medicines, updateMedicine, deleteMedicine } = useMedicine();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [medicineFormData, setMedicineFormData] = useState({});
  const [search, setSearch] = useState("");
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

  const handleUpdateMedicine = (medicine) => {
    setShowForm(!showForm);
    setMedicineFormData(medicine)
  }

  

  const filteredMedicines = medicines?.filter((medicine) => {
  
    const matchesSearch = medicine.medicine_name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  })




    return(
        <div className='h-screen w-full flex flex-col sm:flex-row'>
            <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%]'>
                <Navigation />
            </div>

              {showForm && <MedicineForm medicine={medicineFormData} 
                                    onClose={() => setShowForm(false)} 
                                    onUpdate={(updatedForm) => updateMedicine(updatedForm)}
                                    onDelete={(medicineId) => deleteMedicine(medicineId)}/>
                             }

            <div className='h-[92%] min-w-[360px] sm:min-w-0  w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-5'>
                <div className='w-full h-full flex flex-col gap-4 items-center'>
                    <div className='h-[10%]  w-full flex flex-col gap-1'>
                        <p className='text-[1.7rem] '>Medicine Inventory</p>
                        <p className='text-[1rem] text-gray-500'>Manage medicine</p>
                    </div>

                    <div className='h-[10%] w-full  flex justify-between items-center'>
                        <div className='w-[85%] h-[60%] rounded-[10px] border-[#EACBCB]  border flex items-center'>
                            <img src={Search} alt="" className='h-8 w-[10%]' />
                            <input type="text" className='w-[90%] h-full outline-none' onChange={(e) => setSearch(e.target.value)}/>
                        </div>
                        <div className='w-[10%] h-[90%] flex items-center justify-center cursor-pointer'
                        onClick={() => handleAddMedicine()}>
                            <img src={Medicine} alt="" className='h-[90%] md:h-[70%]' />
                        </div>
                    </div>

                    <div className='w-full h-[75%] overflow-auto flex items-center flex-col gap-2'>


                        <div className="h-[5%] w-[95%] flex gap-2">
                            <div className="medicineInfoData font-medium w-[25%] sm:w-[20%] h-full">
                                <p>Medicine Name</p>
                            </div>

                            <div className="medicineInfoData font-medium w-[25%] sm:w-[20%] h-full">
                                <p>Medicine Type</p>
                            </div>

                            <div className="medicineInfoData font-medium w-[25%] sm:w-[20%] h-full">
                                <p>Batch</p>
                            </div>

                            <div className="medicineInfoData font-medium w-[25%] sm:w-[20%] h-full">
                                <p>Stock</p>
                            </div>

                            <div className="hidden 2xl:flex  justify-center text-[.8rem] sm:w-[20%] h-full tracking-[2px] font-medium">
                                <p>Expiry date</p>
                            </div>

                            <div className="hidden sm:flex  justify-center text-[.8rem] sm:w-[20%] h-full tracking-[2px] font-medium">
                                <p>Status</p>
                            </div>
                        </div>


                        {filteredMedicines && filteredMedicines.length > 0 ? (
                            filteredMedicines.map((medicine) => (
                                <div 
                                    key={medicine.id} 
                                    className='mt-4 md:mt-1 h-[5%] w-[95%] flex gap-2  hover:decoration-2 cursor-default hover:underline'
                                    onClick={() => handleUpdateMedicine(medicine)}
                                >
                                    <div className='medicineInfoData w-[25%] sm:w-[20%] h-full'>
                                        <p>{medicine.medicine_name}</p>
                                    </div>

                                    <div className='medicineInfoData w-[25%] sm:w-[20%] h-full'>
                                        <p>{medicine.type}</p>
                                    </div>

                                    <div className='medicineInfoData w-[25%] sm:w-[20%] h-full'>
                                        <p>{medicine.batch_number}</p>
                                    </div>

                                    <div className='medicineInfoData w-[25%] sm:w-[20%] h-full'>
                                        <p>{medicine.stock_level}</p>
                                    </div>

                                    
                                    <div className='hidden 2xl:flex items-center justify-center text-[.8rem] tracking-[2px] sm:w-[20%] h-full'>
                                         <p>{formatDate(medicine.expiry_date)}</p>
                                    </div>

                                    <div className='hidden sm:flex items-center justify-center text-[.8rem] tracking-[2px] sm:w-[20%] h-full'>
                                        <div
                                            className={`h-3 w-3 rounded-full ${
                                            medicine.stock_level > 30 ? "bg-[#10b981]" : medicine.stock_level > 10 && medicine.stock_level < 30 ? "bg-[#f59e0b]"  : "bg-[#ef4444]"
                                            }`}
                                        ></div>
                                    </div>


                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 mt-4">No medicines available.</p>
                        )}
                    </div>


                </div>
            </div>
        </div>
    )
}

export default newMedicine