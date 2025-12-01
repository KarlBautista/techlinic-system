import '../componentCss/newAnalytics.css'
import Navigation from '../components/newNavigation.jsx'
import MedicineChart from '../charts/MedicinesChart.jsx'
import PatientCountsChart from '../charts/PatientCountsChart'
import PatientsPerDepartmentChart from '../charts/PatientsPerDepartmentChart'
import TopDiagnosisChart from '../charts/TopDiagnosisChart'

const  newAnalytics= ()=> {
    return(
        <div className='h-screen w-full flex flex-col sm:flex-row'>
            <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%]'>
                <Navigation />
            </div>

            <div className='h-[92%] min-w-[360px] sm:min-w-0  w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-5'>
                <div className='w-full h-full flex flex-col gap-4 items-center'>
                    <div className='h-[10%]  w-full flex flex-col gap-1'>
                        <p className='text-[1.7rem] '>Medical Analytics</p>
                        <p className='text-[1rem] text-gray-500'>Manage reports</p>
                    </div>
                    <div className='w-full h-[90%] flex justify-center flex-row overflow-auto gap-2 lg:flex-nowrap flex-wrap'>
                        <div className='sm:hidden h-[50%] w-[98%] flex rounded-lg border border-gray-200 p-2 shadow-md'>
                            <MedicineChart/>
                        </div>
                        <div className='lg:hidden  h-[50%] w-[98%] flex rounded-lg border border-gray-200 p-2 shadow-lg'>
                            <PatientCountsChart/>
                        </div>
                        <div className='lg:hidden  w-[98%] flex rounded-lg border border-gray-200 p-2 shadow-lg'>
                            <TopDiagnosisChart/>
                        </div>
                        <div className='lg:hidden h-[60%] w-[98%] flex rounded-lg border border-gray-200 p-2 shadow-lg'>
                            <PatientsPerDepartmentChart/>
                        </div>

                        <div className='lg:flex hidden w-[70%] gap-1 flex-col h-full'>
                            <div className='h-[40%] w-full flex gap-1'>
                                <div className='h-full w-[50%]  rounded-lg border border-gray-200 p-2 shadow-md'>
                                    <MedicineChart/>
                                </div>
                                <div className='h-full w-[50%] rounded-lg border border-gray-200 p-2 shadow-md'>
                                    <PatientCountsChart/>
                                </div>
                            </div>


                            <div className='rounded-lg border border-gray-200 p-2 shadow-md w-full'>
                                <TopDiagnosisChart/>
                            </div>
                        </div>
                        <div className='lg:flex hidden rounded-lg border border-gray-200 p-2 shadow-md w-[30%] h-full overflow-hidden'>
                                <PatientsPerDepartmentChart/>
                        </div>
                        

                    </div>
                </div>
            </div>
        </div>
    )
}

export default newAnalytics