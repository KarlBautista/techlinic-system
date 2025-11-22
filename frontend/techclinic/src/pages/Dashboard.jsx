import React, { useEffect, useRef } from 'react'
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import useAuth from '../store/useAuthStore';
import useData from '../store/useDataStore';
const Dashboard = () => {
  const { authenticatedUser } = useAuth();
  const { patientRecords } = useData();
  const date = new Date();
function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}


 console.log(patientRecords)
  return (
    <div className='flex h-full w-full gap-2'>
      <div className='w-[17%] h-full'>
           <Navigation />
      </div>
      <div className='p-5 w-[83%] h-full flex flex-col gap-5'>
         <div className='w-full flex flex-col gap-2'>
          <h2 className='text-2xl font-semibold text-gray-900'>Good Day, Dr. {authenticatedUser?.user_metadata?.name}</h2>
          <h3 className='text-gray-500'>{formatDate(new Date())}</h3>
      </div>
      {/* Summary boxes */}
      <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='p-4 bg-white rounded-lg shadow-md flex flex-col'>
          <span className='text-sm text-gray-500'>Total Patients</span>
          <span className='text-3xl font-bold text-[#b01c34] mt-2'>0</span>
          <span className='text-xs text-gray-400 mt-1'>Number of registered patients</span>
        </div>

        <div className='p-4 bg-white rounded-lg shadow-md flex flex-col'>
          <span className='text-sm text-gray-500'>Total Visits</span>
          <span className='text-3xl font-bold text-[#b01c34] mt-2'>0</span>
          <span className='text-xs text-gray-400 mt-1'>Total clinic visits recorded</span>
        </div>

        <div className='p-4 bg-white rounded-lg shadow-md flex flex-col'>
          <span className='text-sm text-gray-500'>Total Diagnoses</span>
          <span className='text-3xl font-bold text-[#b01c34] mt-2'>0</span>
          <span className='text-xs text-gray-400 mt-1'>Total diagnoses entries</span>
        </div>

        <div className='p-4 bg-white rounded-lg shadow-md flex flex-col'>
          <span className='text-sm text-gray-500'>Medicine Inventory</span>
          <span className='text-3xl font-bold text-[#b01c34] mt-2'>0</span>
          <span className='text-xs text-gray-400 mt-1'>Total medicines in stock</span>
        </div>
      </div>

      <div>
        <h1 className='text-2xl font-semibold'>Recent Records</h1>
      </div>

      {/* ito table*/}
  <div className=' w-full overflow-x-auto'>
    <table className='min-w-full border-collapse border border-gray-200 rounded-lg overflow-hidden'>
      <thead className='bg-[#C41E3A]'>
        <tr>
          <th className='px-4 py-2 text-left text-sm font-medium text-white border-b'>Student ID</th>
          <th className='px-4 py-2 text-left text-sm font-medium text-white border-b'>Name</th>
          <th className='px-4 py-2 text-left text-sm font-medium text-white border-b'>Diagnosis</th>
          <th className='px-4 py-2 text-left text-sm font-medium text-white border-b'>Department</th>
          <th className='px-4 py-2 text-left text-sm font-medium text-white border-b'>Created at</th>
        </tr>
      </thead>
      <tbody>
        {patientRecords.data.map((patient) => (
          <tr key={patient.id} className='hover:bg-gray-50 cursor-pointer transition-colors'>
            <td className='px-4 py-3 text-sm text-gray-800 border-b'>{patient.student_id}</td>
            <td className='px-4 py-3 text-sm text-gray-800 border-b'>{`${patient.first_name} ${patient.last_name}`}</td>
             <td className='px-4 py-3 text-sm text-gray-800 border-b'>{patient.diagnoses[0].diagnosis}</td>
            <td className='px-4 py-3 text-sm text-gray-800 border-b'>{patient.department}</td>
            <td className='px-4 py-3 text-sm text-gray-800 border-b'>{formatDate(patient.created_at)}</td>
          </tr>
        ))}
      </tbody>
    </table>
</div>
      </div>
    
    </div>

  )
}

export default Dashboard
