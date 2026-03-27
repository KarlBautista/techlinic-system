import MedicineChart from '../charts/MedicinesChart.jsx'
import PatientCountsChart from '../charts/PatientCountsChart'
import PatientsPerDepartmentChart from '../charts/PatientsPerDepartmentChart'
import TopDiagnosisChart from '../charts/TopDiagnosisChart'
import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'

/* ───── Animation variants ───── */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.08 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } }
};

/* ───── Glassmorphism card classes ───── */
const glassCard = 'rounded-2xl bg-white/60 dark:bg-[#161B26]/90 backdrop-blur-xl border border-white/40 dark:border-[#333741]/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.55)] p-5 relative overflow-hidden'
const glassCardHover = 'transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_14px_42px_rgba(0,0,0,0.7)] hover:bg-white/70 dark:hover:bg-[#1F242F]/95'

const newAnalytics = () => {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className='flex flex-col gap-5 h-full min-h-0 relative'
        >
            {/* ─── Subtle ambient background blobs ─── */}
            <div className='pointer-events-none absolute inset-0 overflow-hidden -z-10'>
                <div className='absolute -top-24 -right-24 w-96 h-96 rounded-full bg-crimson-100/40 dark:bg-white/5 blur-3xl' />
                <div className='absolute -bottom-32 -left-32 w-md h-112 rounded-full bg-blue-100/30 dark:bg-white/3 blur-3xl' />
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-50/40 dark:bg-white/3 blur-3xl' />
            </div>

            {/* ─── Page Header ─── */}
            <motion.div
                variants={itemVariants}
                className='flex items-center justify-between shrink-0'
            >
                <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-xl bg-crimson-50 dark:bg-[#1F242F] flex items-center justify-center ring-1 ring-crimson-100 dark:ring-[#333741]'>
                        <BarChart3 className='w-6 h-6 text-crimson-600 dark:text-crimson-300' />
                    </div>
                    <div>
                        <h1 className='text-2xl sm:text-[1.7rem] font-bold text-gray-800 dark:text-slate-100 tracking-tight'>Medical Analytics</h1>
                        <p className='text-sm font-medium text-gray-400 dark:text-gray-400 mt-0.5'>Overview of clinic performance and reports</p>
                    </div>
                </div>
                <div className='hidden sm:flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-[#1F242F]/70 backdrop-blur-md rounded-full border border-emerald-200/60 dark:border-[#333741] shadow-sm'>
                    <span className='w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse' />
                    <span className='text-xs font-semibold tracking-wide text-emerald-700 dark:text-gray-300'>Live data</span>
                </div>
            </motion.div>

            {/* ─── Charts Grid ─── */}

            {/* ─── Mobile / Tablet view ─── */}
            <div className='lg:hidden flex flex-col gap-4 flex-1 min-h-0'>
                <motion.div variants={itemVariants}
                    className={`h-72 w-full ${glassCard} ${glassCardHover}`}>
                    <PatientCountsChart />
                </motion.div>
                <motion.div variants={itemVariants}
                    className={`h-80 w-full ${glassCard} ${glassCardHover}`}>
                    <PatientsPerDepartmentChart />
                </motion.div>
                <motion.div variants={itemVariants}
                    className={`h-64 w-full ${glassCard} ${glassCardHover}`}>
                    <MedicineChart />
                </motion.div>
                <motion.div variants={itemVariants}
                    className={`h-auto w-full ${glassCard} ${glassCardHover}`}>
                    <TopDiagnosisChart />
                </motion.div>
            </div>

            {/* ─── Desktop bento grid ─── */}
            <div className='hidden lg:flex flex-1 min-h-0 gap-4'>
                {/* Left column */}
                <div className='flex flex-col w-[60%] gap-4 min-h-0'>
                    {/* Patient Counts chart */}
                    <motion.div variants={itemVariants} className={`h-[50%] min-h-52 ${glassCard} ${glassCardHover}`}>
                        <PatientCountsChart />
                    </motion.div>

                    {/* Top Diagnoses chart */}
                    <motion.div variants={itemVariants} className={`flex-1 min-h-52 ${glassCard} ${glassCardHover}`}>
                        <TopDiagnosisChart />
                    </motion.div>
                </div>

                {/* Right column */}
                <div className='flex flex-col w-[40%] gap-4 min-h-0'>
                    {/* Medicine Stock */}
                    <motion.div variants={itemVariants} className={`h-[45%] min-h-52 ${glassCard} ${glassCardHover}`}>
                        <MedicineChart />
                    </motion.div>

                    {/* Patients Per Department */}
                    <motion.div variants={itemVariants} className={`flex-1 min-h-52 ${glassCard} ${glassCardHover} flex flex-col`}>
                        <PatientsPerDepartmentChart />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}

export default newAnalytics
