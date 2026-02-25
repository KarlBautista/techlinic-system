import '../componentCss/newAnalytics.css'
import MedicineChart from '../charts/MedicinesChart.jsx'
import PatientCountsChart from '../charts/PatientCountsChart'
import PatientsPerDepartmentChart from '../charts/PatientsPerDepartmentChart'
import TopDiagnosisChart from '../charts/TopDiagnosisChart'
import { motion } from 'framer-motion'

const  newAnalytics= ()=> {
    return(
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className='flex flex-col gap-5'
            >
                    {/* ─── Page Header ─── */}
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className='flex items-center justify-between'
                    >
                        <div>
                            <h1 className='text-2xl font-bold text-gray-800'>Medical Analytics</h1>
                            <p className='text-sm text-gray-500 mt-1'>Overview of clinic performance and reports</p>
                        </div>
                        <div className='hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full ring-1 ring-emerald-100'>
                            <span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
                            <span className='text-xs font-medium text-emerald-700'>Live data</span>
                        </div>
                    </motion.div>

                    {/* ─── Charts Grid ─── */}
                    <div className='w-full flex-1 flex justify-center flex-row overflow-auto gap-4 lg:flex-nowrap flex-wrap'>
                        {/* ─── Mobile / Tablet view ─── */}
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}
                          className='sm:hidden h-[50%] w-full flex rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                            <MedicineChart/>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.35 }}
                          className='lg:hidden h-[50%] w-full flex rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                            <PatientCountsChart/>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }}
                          className='lg:hidden w-full flex rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                            <TopDiagnosisChart/>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.35 }}
                          className='lg:hidden h-[60%] w-full flex rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                            <PatientsPerDepartmentChart/>
                        </motion.div>

                        {/* ─── Desktop view ─── */}
                        <div className='lg:flex hidden w-[70%] gap-4 flex-col h-full'>
                            <div className='h-[40%] w-full flex gap-4'>
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}
                                  className='h-full w-[50%] rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                                    <MedicineChart/>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.35 }}
                                  className='h-full w-[50%] rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                                    <PatientCountsChart/>
                                </motion.div>
                            </div>

                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }}
                              className='rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 w-full flex-1'>
                                <TopDiagnosisChart/>
                            </motion.div>
                        </div>
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.35 }}
                          className='lg:flex hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 w-[30%] h-full overflow-hidden'>
                            <PatientsPerDepartmentChart/>
                        </motion.div>
                    </div>
            </motion.div>
    )
}

export default newAnalytics