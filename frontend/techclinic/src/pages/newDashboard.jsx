
import NewNavigation from '../components/newNavigation.jsx'
import React, { useEffect, useRef } from 'react'
import useAuth from '../store/useAuthStore';
import useData from '../store/useDataStore';
import Notification from '../assets/componentImage/notification.svg'
import useMedicine from '../store/useMedicineStore';


import Swal from "sweetalert2";
import { useLocation, Link, useNavigate } from 'react-router-dom'

import AnimateNumber from "../components/AnimateNumber"


const NewDashboard = () => {
    
    const { authenticatedUser } = useAuth();
    const { patientRecords, patientsData} = useData();
    const records = patientRecords?.data ?? [];
    const { medicines } = useMedicine();

function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

  const handleAddRecord = () => {
    navigate("/new-patient");
  }

  const handleAddMedicine = () => {
    navigate("/add-medicine")
  }


 console.log('mga patientssss', patientsData)


    return (
        <div className='h-screen w-full flex flex-col sm:flex-row'>
            <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%]'>
                <NewNavigation/>
            </div>
            <div className='h-[92%] min-w-[360px] sm:min-w-0  w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-2'>
                <div className='h-[10%] p-2 w-full flex gap-1'>
                    <div className='w-[90%] h-full flex flex-col'>
                        <h2 className='text-[1.2rem] font-semibold text-gray-900'>Good Day, Dr. {authenticatedUser?.user_metadata?.name}</h2>
                        <h3 className='text-gray-500 text-[.7rem]'>{formatDate(new Date())}</h3>
                    </div>
                    <Link to={'/notifications'} className='w-[10%] h-full  flex items-center justify-center'>
                        <img src={Notification}  className='sm:hidden h-5  cursor-pointer' alt="" />
                    </Link>
                </div>


                <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <div className='p-4 bg-white rounded-lg shadow-md'>
                        <p className='text-sm text-gray-500'>Total Patients</p>
                        <p className='text-3xl font-bold text-[#b01c34] mt-2'>{<AnimateNumber value={patientsData?.length}/>}</p>
                        <p className='text-xs text-gray-400 mt-1'>Number of registered patients</p>
                    </div>

                    <div className=' p-4 bg-white rounded-lg shadow-md '>
                        <p className='text-sm text-gray-500'>Total Visits</p>
                        <p className='text-3xl font-bold text-[#b01c34] mt-2'>{<AnimateNumber value={records?.length}/>}</p>
                        <p className='text-xs text-gray-400 mt-1'>Total clinic visits recorded</p>
                    </div>

                    <div className='p-4 bg-white rounded-lg shadow-md '>
                        <p className='text-sm text-gray-500'>Total Diagnoses</p>
                        <p className='text-3xl font-bold text-[#b01c34] mt-2'>{<AnimateNumber value={records?.length}/>}</p>
                        <p className='text-xs text-gray-400 mt-1'>Total diagnoses entries</p>
                    </div>

                    <div className='p-4 bg-white rounded-lg shadow-md '>
                        <p className='text-sm text-gray-500'>Medicine Inventory</p>
                        <p className='text-3xl font-bold text-[#b01c34] mt-2'><AnimateNumber value={medicines?.length}/></p>
                        <p className='text-xs text-gray-400 mt-1'>Total medicines in stock</p>
                    </div>
                </div>

                
            </div>
        </div>
    )
}

export default NewDashboard
