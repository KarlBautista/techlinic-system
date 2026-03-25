import MedicineChart from '../charts/MedicinesChart.jsx'
import PatientCountsChart from '../charts/PatientCountsChart'
import PatientsPerDepartmentChart from '../charts/PatientsPerDepartmentChart'
import TopDiagnosisChart from '../charts/TopDiagnosisChart'
import { motion } from 'framer-motion'

/* ───── Animation variants ───── */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const newAnalytics = () => {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className='flex flex-col gap-5 h-full min-h-0'
        >
            {/* ─── Page Header ─── */}
            <motion.div
                variants={itemVariants}
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
                <motion.div variants={itemVariants}
                    className='h-72 w-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                    <PatientCountsChart />
                </motion.div>
                <motion.div variants={itemVariants}
                    className='h-80 w-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                    <PatientsPerDepartmentChart />
                </motion.div>
                <motion.div variants={itemVariants}
                    className='h-64 w-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                    <MedicineChart />
                </motion.div>
                <motion.div variants={itemVariants}
                    className='h-auto w-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                    <TopDiagnosisChart />
                </motion.div>
            </div>

            {/* ─── Desktop bento grid ─── */}
            <div className='hidden lg:flex flex-1 min-h-0 gap-4'>
                {/* Left column (stacked: chart + chart) */}
                <div className='flex flex-col w-[60%] gap-4 min-h-0'>
                    {/* Patient Counts chart */}
                    <motion.div variants={itemVariants} className='h-[50%] min-h-52 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                        <PatientCountsChart />
                    </motion.div>

                    {/* Top Diagnoses chart */}
                    <motion.div variants={itemVariants} className='flex-1 min-h-52 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                        <TopDiagnosisChart />
                    </motion.div>
                </div>

                {/* Right column (stacked: medicine stock + department donut) */}
                <div className='flex flex-col w-[40%] gap-4 min-h-0'>
                    {/* Medicine Stock */}
                    <motion.div variants={itemVariants} className='h-[45%] min-h-52 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100'>
                        <MedicineChart />
                    </motion.div>

                    {/* Patients Per Department */}
                    <motion.div variants={itemVariants} className='flex-1 min-h-52 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 flex flex-col'>
                        <PatientsPerDepartmentChart />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}

export default newAnalytics