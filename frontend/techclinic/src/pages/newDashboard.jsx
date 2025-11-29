
import NewNavigation from '../components/newNavigation.jsx'
import React, { useEffect, useRef } from 'react'
import useAuth from '../store/useAuthStore';
import useData from '../store/useDataStore';

const NewDashboard = () => {

  const { authenticatedUser } = useAuth();
  const { patientRecords, patientsData} = useData();

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
            <div className='h-[8%] w-full order-last sm:order-0 sm:w-[25%] sm:h-full md:w-[23%] lg:w-[20%]'>
                <NewNavigation/>
            </div>
            <div className='h-[92%]   w-full sm:h-full sm:w-[75%] overflow-auto p-4'>
                <div className='h-[10%] w-full'>
                    <h2 className='text-2xl font-semibold text-gray-900'>Good Day, Dr. {authenticatedUser?.user_metadata?.name}</h2>
                    <h3 className='text-gray-500'>{formatDate(new Date())}</h3>
                </div>
            </div>
        </div>
    )
}

export default NewDashboard
