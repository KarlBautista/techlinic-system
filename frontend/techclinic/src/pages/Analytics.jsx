import React, { Suspense, lazy } from 'react'
import Navigation from '../components/newNavigation'

// Professional Loader component for use across all pages
export const Loader = () => (
  <div className="w-full h-48 flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 rounded-lg">
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-400 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v4m0 8v4m8-8h-4M4 12H8" />
          </svg>
        </div>
      </div>
      <span className="text-blue-700 font-semibold text-sm tracking-wide">Loading, please wait...</span>
    </div>
  </div>
)

// Lazy load chart components for better performance
const PatientCountsChart = lazy(() => import('../charts/PatientCountsChart'))
const MedicinesChart = lazy(() => import('../charts/MedicinesChart'))
const PatientsPerDepartmentChart = lazy(() => import('../charts/PatientsPerDepartmentChart'))
const TopDiagnosisChart = lazy(() => import('../charts/TopDiagnosisChart'))

const Analytics = () => {
  return (
    <div className='h-screen w-full flex flex-col sm:flex-row'>
      <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%]'>
        <Navigation />
      </div>
    <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-6 flex flex-col gap-4'>
        <div className='w-full flex flex-col gap-2'>
          <h1 className='text-2xl font-bold text-gray-800'>Medical Analytics</h1>
          <p className='text-sm text-gray-500 mt-1'>View clinic statistics and insights</p>
        </div>
        <div className='w-full flex flex-col gap-5'>
          <Suspense fallback={<Loader />}>
            <PatientCountsChart />
          </Suspense>
          <Suspense fallback={<Loader />}>
            <PatientsPerDepartmentChart/>
          </Suspense>
          <Suspense fallback={<Loader />}>
            <MedicinesChart />
          </Suspense>
          <Suspense fallback={<Loader />}>
            <TopDiagnosisChart />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default Analytics
