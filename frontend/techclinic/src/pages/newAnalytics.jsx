import '../componentCss/newAnalytics.css'
import Navigation from '../components/newNavigation.jsx'
import MedicineChart from '../charts/MedicinesChart.jsx'
import PatientCountsChart from '../charts/PatientCountsChart'
import PatientsPerDepartmentChart from '../charts/PatientsPerDepartmentChart'
import TopDiagnosisChart from '../charts/TopDiagnosisChart'

const  newAnalytics= ()=> {
    return(
        <div className='h-screen w-full flex flex-col sm:flex-row'>
            <div className='h-[8%] w-full order-last sm:order-0 sm:w-[20%] sm:h-full md:w-[16%] lg:w-[14%]'>
                <Navigation />
            </div>

            <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[80%] md:w-[84%] lg:w-[86%] overflow-auto p-6'>
                <div className='w-full h-full flex flex-col gap-5'>
                    {/* ─── Page Header ─── */}
                    <div className='flex items-center justify-between'>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-800'>Medical Analytics</h1>
                            <p className='text-sm text-gray-500 mt-1'>Overview of clinic performance and reports</p>
                        </div>
                        <div className='hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full'>
                            <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                            <span className='text-xs font-medium text-green-700'>Live data</span>
                        </div>
                    </div>

                    {/* ─── Charts Grid ─── */}
                    <div className='w-full flex-1 flex justify-center flex-row overflow-auto gap-4 lg:flex-nowrap flex-wrap'>
                        {/* ─── Mobile / Tablet view ─── */}
                        <div className='sm:hidden h-[50%] w-full flex rounded-xl bg-white p-4 shadow-sm'>
                            <MedicineChart/>
                        </div>
                        <div className='lg:hidden h-[50%] w-full flex rounded-xl bg-white p-4 shadow-sm'>
                            <PatientCountsChart/>
                        </div>
                        <div className='lg:hidden w-full flex rounded-xl bg-white p-4 shadow-sm'>
                            <TopDiagnosisChart/>
                        </div>
                        <div className='lg:hidden h-[60%] w-full flex rounded-xl bg-white p-4 shadow-sm'>
                            <PatientsPerDepartmentChart/>
                        </div>

                        {/* ─── Desktop view ─── */}
                        <div className='lg:flex hidden w-[70%] gap-4 flex-col h-full'>
                            <div className='h-[40%] w-full flex gap-4'>
                                <div className='h-full w-[50%] rounded-xl bg-white p-4 shadow-sm'>
                                    <MedicineChart/>
                                </div>
                                <div className='h-full w-[50%] rounded-xl bg-white p-4 shadow-sm'>
                                    <PatientCountsChart/>
                                </div>
                            </div>

                            <div className='rounded-xl bg-white p-4 shadow-sm w-full flex-1'>
                                <TopDiagnosisChart/>
                            </div>
                        </div>
                        <div className='lg:flex hidden rounded-xl bg-white p-4 shadow-sm w-[30%] h-full overflow-hidden'>
                            <PatientsPerDepartmentChart/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default newAnalytics