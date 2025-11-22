import React, { useEffect, useRef } from 'react'
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import useAuth from '../store/useAuthStore';
import useData from '../store/useDataStore';
import AnimateNumber from "../components/AnimateNumber"
const Dashboard = () => {
  const { authenticatedUser } = useAuth();
  const { patientRecords, patientsData} = useData();
  const records = patientRecords?.data ?? [];
  const navigate = useNavigate();
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
    <div className='flex h-full w-full gap-2'>
      <div className='w-[17%] h-full'>
           <Navigation />
      </div>
      <div className='p-5 w-[83%] h-full flex flex-col gap-5'>
         <div className='w-full flex flex-col gap-2'>
          <h2 className='text-2xl font-semibold text-gray-900'>Good Day, Dr. {authenticatedUser?.user_metadata?.name}</h2>
          <h3 className='text-gray-500'>{formatDate(new Date())}</h3>
      </div>
   
      <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='p-4 bg-white rounded-lg shadow-md flex flex-col'>
          <span className='text-sm text-gray-500'>Total Patients</span>
          <span className='text-3xl font-bold text-[#b01c34] mt-2'>{<AnimateNumber value={patientsData?.length}/>}</span>
          <span className='text-xs text-gray-400 mt-1'>Number of registered patients</span>
        </div>

        <div className='p-4 bg-white rounded-lg shadow-md flex flex-col'>
          <span className='text-sm text-gray-500'>Total Visits</span>
          <span className='text-3xl font-bold text-[#b01c34] mt-2'>{<AnimateNumber value={records?.length}/>}</span>
          <span className='text-xs text-gray-400 mt-1'>Total clinic visits recorded</span>
        </div>

        <div className='p-4 bg-white rounded-lg shadow-md flex flex-col'>
          <span className='text-sm text-gray-500'>Total Diagnoses</span>
          <span className='text-3xl font-bold text-[#b01c34] mt-2'>{<AnimateNumber value={records?.length}/>}</span>
          <span className='text-xs text-gray-400 mt-1'>Total diagnoses entries</span>
        </div>

        <div className='p-4 bg-white rounded-lg shadow-md flex flex-col'>
          <span className='text-sm text-gray-500'>Medicine Inventory</span>
          <span className='text-3xl font-bold text-[#b01c34] mt-2'>0</span>
          <span className='text-xs text-gray-400 mt-1'>Total medicines in stock</span>
        </div>
      </div>

      {/* mga mock quick access */}
      <div className='w-full mt-4'>
        <h2 className='text-xl font-semibold mb-3'>Quick Access</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <button className='p-4 bg-white rounded-lg shadow-md flex items-start gap-3 hover:shadow-lg transition'
          onClick={() => handleAddRecord()}>
            <span className='w-12 h-12 rounded-full bg-gradient-to-br from-[#f7d6d8] to-[#f3bfc2] flex items-center justify-center text-white'>
              <svg xmlns="http://www.w3.org/2000/svg" className='w-6 h-6 text-[#b01c34]' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <div className='text-left'>
              <div className='text-sm font-medium text-gray-900'>Add Record</div>
              <div className='text-xs text-gray-500'>Create a new patient record</div>
            </div>
          </button>

          <button className='p-4 bg-white rounded-lg shadow-md flex items-start gap-3 hover:shadow-lg transition'
          onClick={() => handleAddMedicine()}>
            <span className='w-12 h-12 rounded-full bg-gradient-to-br from-[#f7d6d8] to-[#f3bfc2] flex items-center justify-center text-white'>
              <svg xmlns="http://www.w3.org/2000/svg" className='w-6 h-6 text-[#b01c34]' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
              </svg>
            </span>
            <div className='text-left'>
              <div className='text-sm font-medium text-gray-900'>Add Medicine</div>
              <div className='text-xs text-gray-500'>Register new medicine item</div>
            </div>
          </button>

          <button className='p-4 bg-white rounded-lg shadow-md flex items-start gap-3 hover:shadow-lg transition'>
            <span className='w-12 h-12 rounded-full bg-gradient-to-br from-[#f7d6d8] to-[#f3bfc2] flex items-center justify-center text-white'>
              <svg xmlns="http://www.w3.org/2000/svg" className='w-6 h-6 text-[#b01c34]' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <div className='text-left'>
              <div className='text-sm font-medium text-gray-900'>Import</div>
              <div className='text-xs text-gray-500'>Upload records or inventory</div>
            </div>
          </button>

          <button className='p-4 bg-white rounded-lg shadow-md flex items-start gap-3 hover:shadow-lg transition'>
            <span className='w-12 h-12 rounded-full bg-gradient-to-br from-[#f7d6d8] to-[#f3bfc2] flex items-center justify-center text-white'>
              <svg xmlns="http://www.w3.org/2000/svg" className='w-6 h-6 text-[#b01c34]' fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6M7 9h10" />
              </svg>
            </span>
            <div className='text-left'>
              <div className='text-sm font-medium text-gray-900'>Reports</div>
              <div className='text-xs text-gray-500'>Generate reports & exports</div>
            </div>
          </button>
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
        {records.length === 0 ? (
          <tr>
            <td colSpan={5} className='px-4 py-6 text-center text-sm text-gray-500'>No recent records found.</td>
          </tr>
        ) : (
          records.map((patient) => (
            <tr key={patient.id} className='hover:bg-gray-50 cursor-pointer transition-colors'>
              <td className='px-4 py-3 text-sm text-gray-800 border-b'>{patient.student_id ?? '-'}</td>
              <td className='px-4 py-3 text-sm text-gray-800 border-b'>{`${patient.first_name ?? ''} ${patient.last_name ?? ''}`.trim() || '-'}</td>
              <td className='px-4 py-3 text-sm text-gray-800 border-b'>{patient.diagnoses?.[0]?.diagnosis ?? '-'}</td>
              <td className='px-4 py-3 text-sm text-gray-800 border-b'>{patient.department ?? '-'}</td>
              <td className='px-4 py-3 text-sm text-gray-800 border-b'>{formatDate(patient.created_at)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
</div>
      </div>
    
    </div>

  )
}

export default Dashboard
