import React from 'react'
import Navigation from '../components/Navigation'

import PatientCountsChart from '../charts/PatientCountsChart'
import MedicinesChart from '../charts/MedicinesChart'
import PatientsPerDepartmentChart from '../charts/PatientsPerDepartmentChart'
import TopDiagnosisChart from '../charts/TopDiagnosisChart'
const Analytics = () => {


  return (
    <div className='flex h-full w-full gap-2'>
      <div className='w-[17%] h-full sticky top-0'>
        <Navigation />
      </div>
    <div className='p-5 w-[83%] h-auto flex flex-col gap-5 overflow-y-auto'>
        <div className='w-full flex flex-col gap-2'>
          <h2 className='text-2xl font-semibold text-gray-900'>Medical Analytics</h2>
        </div>
        <div className='w-full flex flex-col gap-5'>
          <PatientCountsChart />
          <PatientsPerDepartmentChart/>
          <MedicinesChart />
          <TopDiagnosisChart />
         
        </div>
      </div>
    </div>
  )
}

export default Analytics
