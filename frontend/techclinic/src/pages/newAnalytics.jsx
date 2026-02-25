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
                className='flex flex-col gap-5 h-full min-h-0'
            >
                    {/* ─── Page Header ─── */}
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className='flex items-center justify-between shrink-0'
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

                    {/* ─── Mobile / Tablet view ─── */}
                    <div className='lg:hidden flex flex-col gap-4 flex-1 min-h-0'>
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}
                          className='h-64 w-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                            <MedicineChart/>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.35 }}
                          className='h-64 w-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                            <PatientCountsChart/>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }}
                          className='h-72 w-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                            <TopDiagnosisChart/>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.35 }}
                          className='h-80 w-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                            <PatientsPerDepartmentChart/>
                        </motion.div>
                    </div>

                    {/* ─── Desktop view ─── */}
                    <div className='hidden lg:flex flex-1 min-h-0 gap-4'>
                        {/* Left column (70%) — stacked charts */}
                        <div className='flex flex-col w-[70%] gap-4 min-h-0'>
                            <div className='h-[45%] min-h-[200px] w-full flex gap-4'>
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}
                                  className='h-full w-1/2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                                    <MedicineChart/>
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.35 }}
                                  className='h-full w-1/2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                                    <PatientCountsChart/>
                                </motion.div>
                            </div>
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.35 }}
                              className='rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 w-full flex-1 min-h-[200px]'>
                                <TopDiagnosisChart/>
                            </motion.div>
                        </div>

                        {/* Right column (30%) — pie/donut chart, full height */}
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.35 }}
                          className='rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 w-[30%] min-h-0 flex flex-col'>
                            <PatientsPerDepartmentChart/>
                        </motion.div>
                    </div>
            </motion.div>
    )
}

export default newAnalytics