import '../componentCss/newAnalytics.css'
import Navigation from '../components/newNavigation.jsx'
import MedicineChart from '../charts/MedicinesChart.jsx'

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
                    <div className='w-full h-[90%] flex flex-row overflow-auto gap-2 flex-wrap'>
                        <div className='h-[50%] w-full bg-red-100 flex'>
                            <MedicineChart/>
                        </div>
                        <div className='h-[50%] w-full bg-red-100'></div>
                        <div className='h-[50%] w-full bg-red-100'></div>
                        <div className='h-[50%] w-full bg-red-100'></div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default newAnalytics