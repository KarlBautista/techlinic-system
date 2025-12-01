import React from 'react'
import Navigation from '../components/newNavigation'

import PatientCountsChart from '../charts/PatientCountsChart'
import MedicinesChart from '../charts/MedicinesChart'
import PatientsPerDepartmentChart from '../charts/PatientsPerDepartmentChart'
import TopDiagnosisChart from '../charts/TopDiagnosisChart'
const Analytics = () => {


  return (
    <div className='h-screen w-full flex flex-col sm:flex-row'>
      <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%]'>
        <Navigation />
      </div>
    <div className='h-[92%] min-w-[360px] sm:min-w-0  w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-5'>
        <div className='w-full flex flex-col gap-2'>
          <h2 className='text-2xl font-semibold text-gray-900 mb-5'>Medical Analytics</h2>
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
