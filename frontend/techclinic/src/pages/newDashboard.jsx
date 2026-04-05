import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import useAuth from '../store/useAuthStore';
import useData from '../store/useDataStore';
import useMedicine from '../store/useMedicineStore';
import usePresenceStore from '../store/usePresenceStore';
import useChart from '../store/useChartStore';
import { motion, AnimatePresence } from 'framer-motion';

import { showToast } from '../components/Toast';
import { Link, useNavigate } from 'react-router-dom'

import AnimateNumber from "../components/AnimateNumber"
import PatientCountsChart from '../charts/PatientCountsChart';
import PatientsPerDepartmentChart from '../charts/PatientsPerDepartmentChart';
import TopDiagnosisChart from '../charts/TopDiagnosisChart';
import MedicinesChart from '../charts/MedicinesChart';

import {
    Users, CalendarDays, ClipboardCheck, Pill,
    Clock, Plus, Search, ArrowRight, Activity, TrendingUp,
    ChevronRight, ChevronLeft, UserCheck, Circle, X
} from 'lucide-react'

/* ───── Animation variants ───── */
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const cardHover = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -2, transition: { duration: 0.2, ease: "easeOut" } }
};

/* ───── Chart carousel config ───── */
const CHART_SLIDES = [
    { key: 'patient-counts', label: 'Patient Visits', component: PatientCountsChart },
    { key: 'per-department', label: 'By Department', component: PatientsPerDepartmentChart },
    { key: 'top-diagnosis', label: 'Top Diagnoses', component: TopDiagnosisChart },
    { key: 'medicine-stock', label: 'Medicine Stock', component: MedicinesChart },
];

const NewDashboard = () => {
    const { authenticatedUser, userProfile, allUsers, getAllUsers } = useAuth();
    const { onlineUserIds } = usePresenceStore();
    const { patientRecords, patientsData, getRecords } = useData();
    const records = patientRecords?.data ?? [];
    const { medicines, getMedicines } = useMedicine();
    const navigate = useNavigate();
    const refreshIntervalRef = useRef(null);
    const [initialLoading, setInitialLoading] = useState(true);

    /* ───── Calendar state ───── */
    const [calendarDate, setCalendarDate] = useState(new Date());

    /* ───── Chart carousel state ───── */
    const [activeChart, setActiveChart] = useState(0);
    const chartTimerRef = useRef(null);

    const startChartTimer = useCallback(() => {
        if (chartTimerRef.current) clearInterval(chartTimerRef.current);
        chartTimerRef.current = setInterval(() => {
            setActiveChart(prev => (prev + 1) % CHART_SLIDES.length);
        }, 12000);
    }, []);

    useEffect(() => {
        startChartTimer();
        return () => { if (chartTimerRef.current) clearInterval(chartTimerRef.current); };
    }, [startChartTimer]);

    const goToChart = (idx) => {
        setActiveChart(idx);
        startChartTimer();
    };

    const prevChart = () => {
        setActiveChart(prev => (prev - 1 + CHART_SLIDES.length) % CHART_SLIDES.length);
        startChartTimer();
    };

    const nextChart = () => {
        setActiveChart(prev => (prev + 1) % CHART_SLIDES.length);
        startChartTimer();
    };

    // Auto-refresh data every 15 seconds
    useEffect(() => {
        const fetchData = async () => {
            try {
                await getRecords();
                await getMedicines();
                await getAllUsers();
            } catch (err) {
                console.error('Error auto-refreshing data:', err);
            }
        };

        fetchData().finally(() => setInitialLoading(false));

        // Safety fallback — clear skeleton after 5s even if fetch hangs
        const safetyTimer = setTimeout(() => setInitialLoading(false), 5000);

        refreshIntervalRef.current = setInterval(() => {
            fetchData();
        }, 15000);

        return () => {
            clearTimeout(safetyTimer);
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [getRecords, getMedicines, getAllUsers]);

    function formatDate(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    function formatTime(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    const getDisplayName = () => {
        if (userProfile?.first_name && userProfile?.last_name) {
            return `${userProfile.first_name} ${userProfile.last_name}`;
        } else if (userProfile?.first_name) {
            return userProfile.first_name;
        } else if (authenticatedUser?.user_metadata?.name) {
            return authenticatedUser.user_metadata.name;
        } else if (authenticatedUser?.email) {
            return authenticatedUser.email.split('@')[0];
        }
        return "User";
    };

    const getUserRole = () => {
        return userProfile?.role || "Staff";
    };

    const handleDiagnose = (recordId) => {
        try {
            navigate(`/add-diagnosis/${recordId}`);
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleIndividualRecord = (studentId) => {
        try {
            navigate(`/individual-record/${studentId}`);
        } catch (err) {
            console.error(err.message);
        }
    };

    const handleWaitingForDiagnosis = () => {
        showToast({
            title: "Awaiting Physician Assessment",
            message: "This patient is awaiting physician assessment; a formal diagnosis has not yet been provided.",
            type: "info",
        });
    };

    const isToday = (dateString) => {
        if (!dateString) return false;
        const recordDate = new Date(dateString).toDateString();
        const today = new Date().toDateString();
        return recordDate === today;
    };

    const todayRecords = useMemo(() => {
        if (!records?.length) return [];
        return [...records].reverse().filter(patient => isToday(patient.created_at));
    }, [records]);

    const pendingCount = useMemo(() => {
        return todayRecords.filter(r => r.status === "INCOMPLETE").length;
    }, [todayRecords]);

    const completedCount = useMemo(() => {
        return todayRecords.filter(r => r.status === "COMPLETE").length;
    }, [todayRecords]);

    const pendingRecords = useMemo(() => {
        if (!records?.length) return [];
        return [...records].reverse().filter(r => r.status === "INCOMPLETE");
    }, [records]);

    const [tableFilter, setTableFilter] = useState('today');
    const [currentPage, setCurrentPage] = useState(1);
    const [showChartsModal, setShowChartsModal] = useState(false);

    const rowsPerPage = 5;

    const filteredTableRecords = useMemo(() => {
        if (tableFilter === 'pending') return pendingRecords;
        return todayRecords;
    }, [tableFilter, todayRecords, pendingRecords]);

    const totalPages = Math.ceil((filteredTableRecords?.length || 0) / rowsPerPage);
    const paginatedTableRecords = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredTableRecords.slice(start, start + rowsPerPage);
    }, [filteredTableRecords, currentPage, rowsPerPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [tableFilter]);

    /* ───── Active personnel (all staff) ───── */
    const activePersonnel = useMemo(() => {
        if (!allUsers) return [];
        return allUsers.filter(u => u.id !== authenticatedUser?.id);
    }, [allUsers, authenticatedUser]);

    /* ───── Stat card config ───── */
    const statCards = [
        {
            label: "Total Patients",
            value: patientsData?.length || 0,
            icon: <Users className="w-5 h-5" />,
            iconBg: "bg-crimson-50 dark:bg-crimson-950/30",
            iconColor: "text-crimson-600 dark:text-crimson-300",
        },
        {
            label: "Today's Visits",
            value: todayRecords.length,
            icon: <CalendarDays className="w-5 h-5" />,
            iconBg: "bg-amber-50 dark:bg-amber-950/30",
            iconColor: "text-amber-600 dark:text-amber-300",
        },
        {
            label: "Total Records",
            value: records?.length || 0,
            icon: <ClipboardCheck className="w-5 h-5" />,
            iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
            iconColor: "text-emerald-600 dark:text-emerald-300",
        },
        {
            label: "Medicine Stock",
            value: medicines?.length || 0,
            icon: <Pill className="w-5 h-5" />,
            iconBg: "bg-blue-50 dark:bg-blue-950/30",
            iconColor: "text-blue-600 dark:text-blue-300",
        },
    ];

    return (
        <div className='flex flex-col gap-4 h-full'>
            {initialLoading ? (
                <div className='flex flex-col gap-4 animate-pulse h-full'>
                    <div className='w-full rounded-2xl bg-gray-200 dark:bg-[#1F242F] p-5 h-20' />
                    <div className='flex-1 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4'>
                        <div className='flex flex-col gap-4'>
                            <div className='bg-gray-200 dark:bg-[#1F242F] rounded-xl h-40' />
                            <div className='bg-gray-200 dark:bg-[#1F242F] rounded-xl flex-1 min-h-[340px]' />
                            <div className='bg-gray-200 dark:bg-[#1F242F] rounded-xl h-[160px]' />
                        </div>
                        <div className='flex flex-col gap-4'>
                            <div className='bg-gray-200 dark:bg-[#1F242F] rounded-xl h-[240px]' />
                            <div className='bg-gray-200 dark:bg-[#1F242F] rounded-xl flex-1' />
                        </div>
                    </div>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-4 h-full"
                >
                    {/* ═══════════════════════════════════════════════
                         TOP — Header Bar (Name, Status, Date)
                    ═══════════════════════════════════════════════ */}
                    <motion.div
                        variants={itemVariants}
                        className='w-full rounded-2xl bg-white dark:bg-[#161B26] px-6 py-4 shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'
                    >
                        <div className='flex items-center gap-4'>
                            {/* Avatar */}
                            <div className='w-11 h-11 rounded-full bg-linear-to-br from-crimson-500 to-crimson-700 dark:from-crimson-600 dark:to-crimson-800 flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ring-crimson-100 dark:ring-crimson-900/40'>
                                {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
                            </div>
                            <div>
                                <h1 className='text-lg font-bold text-gray-900 dark:text-slate-100 tracking-tight'>
                                    {getUserRole() === "DOCTOR" ? "Dr. " : ""}{getDisplayName()}
                                </h1>
                                <p className='text-xs text-gray-400 dark:text-gray-500'>TechClinic Management System</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-4'>
                            <span className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-100 dark:ring-emerald-900/50'>
                                <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                                Active
                            </span>
                            <span className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-50 dark:bg-[#1F242F] text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-[#333741]'>
                                {getUserRole()}
                            </span>
                            <span className='text-sm text-gray-500 dark:text-gray-400 font-medium hidden sm:block'>
                                {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                        </div>
                    </motion.div>

                    {/* ═══════════════════════════════════════════════
                         MAIN GRID — Left column + Right column
                    ═══════════════════════════════════════════════ */}
                    <div className='flex-1 grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 min-h-0'>

                        {/* ─── LEFT COLUMN ─── */}
                        <div className='flex flex-col gap-4'>

                            {/* Summary Report */}
                            <motion.div
                                variants={itemVariants}
                                className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] p-5'
                            >
                                <h2 className='text-sm font-semibold text-gray-800 dark:text-slate-100 mb-4'>Summary Report</h2>
                                <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                                    {statCards.map((card, idx) => (
                                        <motion.div
                                            key={idx}
                                            variants={cardHover}
                                            initial="rest"
                                            whileHover="hover"
                                            className='rounded-xl bg-gray-50 dark:bg-[#1F242F] p-4 flex flex-col gap-2 cursor-default ring-1 ring-gray-100 dark:ring-[#333741]'
                                        >
                                            <div className='flex items-center justify-between'>
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.iconBg} ${card.iconColor}`}>
                                                    {card.icon}
                                                </div>
                                            </div>
                                            <div>
                                                <p className='text-2xl font-bold text-gray-900 dark:text-slate-100 tabular-nums'>
                                                    <AnimateNumber value={card.value} />
                                                </p>
                                                <p className='text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5'>{card.label}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Graphs — Charts Carousel */}
                            <motion.div
                                variants={itemVariants}
                                className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] flex flex-col overflow-hidden flex-1'
                                style={{ minHeight: 340 }}
                            >
                                <div className='px-5 py-3 border-b border-gray-100 dark:border-[#1F2A37] flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <Activity className='w-4 h-4 text-gray-400 dark:text-gray-500' />
                                        <h2 className='text-sm font-semibold text-gray-800 dark:text-slate-100'>Graphs</h2>
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <button onClick={prevChart} className='w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F242F] transition-colors cursor-pointer'>
                                            <ChevronLeft className='w-4 h-4' />
                                        </button>
                                        <div className='flex items-center gap-1'>
                                            {CHART_SLIDES.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => goToChart(idx)}
                                                    className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${activeChart === idx
                                                        ? 'bg-crimson-500 w-4'
                                                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'}`}
                                                />
                                            ))}
                                        </div>
                                        <button onClick={nextChart} className='w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F242F] transition-colors cursor-pointer'>
                                            <ChevronRight className='w-4 h-4' />
                                        </button>
                                    </div>
                                </div>
                                <div className='flex-1 p-4 min-h-0 relative overflow-hidden'>
                                    <AnimatePresence mode='wait'>
                                        <motion.div
                                            key={CHART_SLIDES[activeChart].key}
                                            initial={{ opacity: 0, x: 30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -30 }}
                                            transition={{ duration: 0.25 }}
                                            className='w-full h-full'
                                        >
                                            {React.createElement(CHART_SLIDES[activeChart].component)}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                                <div className='px-5 py-2 border-t border-gray-100 dark:border-[#1F2A37] flex items-center justify-between'>
                                    <span className='text-xs font-medium text-gray-500 dark:text-gray-400'>{CHART_SLIDES[activeChart].label}</span>
                                    <button onClick={() => setShowChartsModal(true)} className='text-xs font-medium text-crimson-600 dark:text-crimson-300 hover:text-crimson-700 dark:hover:text-crimson-200 transition-colors cursor-pointer'>
                                        View All →
                                    </button>
                                </div>
                            </motion.div>

                            {/* Active Personnel */}
                            <motion.div
                                variants={itemVariants}
                                className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] flex flex-col max-h-[200px]'
                            >
                                <div className='px-5 py-3 border-b border-gray-100 dark:border-[#1F2A37] flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <UserCheck className='w-4 h-4 text-gray-400 dark:text-gray-500' />
                                        <h2 className='text-sm font-semibold text-gray-800 dark:text-slate-100'>Active Personnel</h2>
                                    </div>
                                    <span className='text-xs text-gray-400 dark:text-gray-500 font-medium'>{activePersonnel.length} staff</span>
                                </div>
                                <div className='flex-1 overflow-auto px-5 py-2'>
                                    {activePersonnel.length > 0 ? (
                                        <div className='flex flex-wrap gap-x-8 gap-y-2'>
                                            {activePersonnel.map((person) => {
                                                const isOnline = onlineUserIds.has(person.id);
                                                return (
                                                <div key={person.id} className='flex items-center gap-3 py-2 min-w-[200px]'>
                                                    <div className='relative'>
                                                        <div className='w-8 h-8 rounded-full bg-linear-to-br from-gray-100 to-gray-50 dark:from-[#293040] dark:to-[#1F242F] flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 ring-1 ring-gray-200 dark:ring-gray-700'>
                                                            {person.first_name?.[0]}{person.last_name?.[0]}
                                                        </div>
                                                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#161B26] ${isOnline ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                                                    </div>
                                                    <div>
                                                        <p className='text-sm font-medium text-gray-800 dark:text-slate-200'>
                                                            {person.role === "DOCTOR" ? "Dr. " : ""}{person.first_name} {person.last_name}
                                                        </p>
                                                        <p className={`text-[10px] ${isOnline ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500'}`}>
                                                            {isOnline ? 'Online' : 'Offline'}
                                                        </p>
                                                    </div>
                                                </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className='flex items-center justify-center h-full text-gray-400 dark:text-gray-500'>
                                            <UserCheck className='w-6 h-6 mr-2 text-gray-300 dark:text-gray-600' />
                                            <p className='text-sm'>No personnel data</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* ─── RIGHT COLUMN ─── */}
                        <div className='flex flex-col gap-4'>

                            {/* Calendar Widget */}
                            <motion.div
                                variants={itemVariants}
                                className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] p-4'
                            >
                                {(() => {
                                    const now = new Date();
                                    const year = calendarDate.getFullYear();
                                    const month = calendarDate.getMonth();
                                    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
                                    const today = now.getDate();
                                    const firstDay = new Date(year, month, 1).getDay();
                                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                                    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                    const blanks = Array.from({ length: firstDay }, (_, i) => i);
                                    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

                                    const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
                                    const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));

                                    return (
                                        <>
                                            <div className='flex items-center justify-between mb-3'>
                                                <button onClick={prevMonth} className='w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F242F] transition-colors cursor-pointer'>
                                                    <ChevronLeft className='w-4 h-4' />
                                                </button>
                                                <h2 className='text-sm font-semibold text-gray-800 dark:text-slate-100'>
                                                    {calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                                </h2>
                                                <button onClick={nextMonth} className='w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F242F] transition-colors cursor-pointer'>
                                                    <ChevronRight className='w-4 h-4' />
                                                </button>
                                            </div>
                                            <div className='grid grid-cols-7 gap-1 text-center'>
                                                {dayLabels.map(d => (
                                                    <span key={d} className='text-[10px] font-medium text-gray-400 dark:text-gray-500 pb-1'>{d}</span>
                                                ))}
                                                {blanks.map(b => (
                                                    <span key={`blank-${b}`} />
                                                ))}
                                                {days.map(d => (
                                                    <span
                                                        key={d}
                                                        className={`text-xs w-7 h-7 flex items-center justify-center mx-auto font-medium ${
                                                            isCurrentMonth && d === today
                                                                ? 'bg-crimson-600 text-white rounded-full'
                                                                : 'text-gray-700 dark:text-gray-300'}`}
                                                    >
                                                        {d}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    );
                                })()}
                            </motion.div>

                            {/* Patient Today — stretches to fill remaining height */}
                            <motion.div
                                variants={itemVariants}
                                className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm ring-1 ring-gray-100 dark:ring-[#1F2A37] flex flex-col overflow-hidden flex-1'
                            >
                                {/* Header with toggle tabs */}
                                <div className='px-5 py-3 border-b border-gray-100 dark:border-[#1F2A37] flex items-center justify-between'>
                                    <div className='flex items-center gap-1 bg-gray-100 dark:bg-[#1F242F] rounded-lg p-0.5 ring-1 ring-gray-200 dark:ring-[#333741]'>
                                        <button
                                            onClick={() => setTableFilter('today')}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${tableFilter === 'today'
                                                ? 'bg-white dark:bg-[#161B26] text-gray-800 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-[#333741]'
                                                : 'text-gray-500 dark:text-[#94969C] hover:text-gray-700 dark:hover:text-gray-200'}`}
                                        >
                                            Today ({todayRecords.length})
                                        </button>
                                        <button
                                            onClick={() => setTableFilter('pending')}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${tableFilter === 'pending'
                                                ? 'bg-white dark:bg-[#161B26] text-gray-800 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-[#333741]'
                                                : 'text-gray-500 dark:text-[#94969C] hover:text-gray-700 dark:hover:text-gray-200'}`}
                                        >
                                            Pending ({pendingRecords.length})
                                            {pendingRecords.length > 0 && tableFilter !== 'pending' && (
                                                <span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse' />
                                            )}
                                        </button>
                                    </div>
                                    <Link to='/patient-record' className='text-xs font-medium text-crimson-600 dark:text-crimson-300 hover:text-crimson-700 dark:hover:text-crimson-200 transition-colors'>
                                        View All →
                                    </Link>
                                </div>

                                {/* Patient list — fills remaining space */}
                                <div className='flex-1 overflow-auto px-5 pb-3'>
                                    {filteredTableRecords.length > 0 ? (
                                        <div className='divide-y divide-gray-50 dark:divide-[#1F2A37]'>
                                            {filteredTableRecords.map((patient) => (
                                                <div
                                                    key={patient.id}
                                                    className='flex items-center justify-between py-2.5 cursor-pointer hover:bg-crimson-50/40 dark:hover:bg-[#1F242F] -mx-2 px-2 rounded-lg transition-colors group'
                                                    onClick={
                                                        patient.status === "INCOMPLETE" && userProfile?.role === "DOCTOR"
                                                            ? () => handleDiagnose(patient.id)
                                                            : patient.status === "INCOMPLETE" && userProfile?.role === "NURSE"
                                                                ? () => handleWaitingForDiagnosis()
                                                                : () => handleIndividualRecord(patient.student_id)
                                                    }
                                                >
                                                    <div className='flex items-center gap-2.5'>
                                                        <div className='w-7 h-7 rounded-full bg-linear-to-br from-crimson-100 to-crimson-50 dark:from-[#293040] dark:to-[#1F242F] flex items-center justify-center text-[10px] font-bold text-crimson-600 dark:text-gray-300 shrink-0 ring-1 ring-crimson-100 dark:ring-gray-700'>
                                                            {patient.first_name?.[0]}{patient.last_name?.[0]}
                                                        </div>
                                                        <div className='min-w-0'>
                                                            <p className='text-sm font-medium text-gray-800 dark:text-slate-200 truncate'>{patient.first_name} {patient.last_name}</p>
                                                            <p className='text-[10px] text-gray-400 dark:text-gray-500'>{formatTime(patient.created_at)}</p>
                                                        </div>
                                                    </div>
                                                    <div className='flex items-center gap-2'>
                                                        {patient.status === "COMPLETE" ? (
                                                            <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-100 dark:ring-emerald-900/60'>
                                                                <span className='w-1 h-1 rounded-full bg-emerald-500' />
                                                                Done
                                                            </span>
                                                        ) : (
                                                            <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-1 ring-amber-100 dark:ring-amber-900/60'>
                                                                <span className='w-1 h-1 rounded-full bg-amber-500 animate-pulse' />
                                                                Pending
                                                            </span>
                                                        )}
                                                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-crimson-500 transition-all" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className='flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500'>
                                            <ClipboardCheck className="w-8 h-8 mb-2 text-gray-300 dark:text-gray-600" />
                                            <p className='text-sm font-medium text-gray-500 dark:text-slate-300'>{tableFilter === 'pending' ? 'No pending records' : 'No records for today'}</p>
                                            <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>{tableFilter === 'pending' ? 'All records complete' : 'Patient visits will appear here'}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* ═══════════════════════════════════════════════
                 Charts Modal Overlay
            ═══════════════════════════════════════════════ */}
            <AnimatePresence>
                {showChartsModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className='fixed inset-0 z-100 flex items-center justify-center'
                        onClick={() => setShowChartsModal(false)}
                    >
                        {/* Backdrop */}
                        <div className='absolute inset-0 bg-black/60' />

                        {/* Modal content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className='relative bg-white dark:bg-[#161B26] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-auto mx-4'
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal header */}
                            <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#1F2A37] sticky top-0 bg-white dark:bg-[#161B26] z-10'>
                                <div className='flex items-center gap-2'>
                                    <Activity className='w-5 h-5 text-crimson-500' />
                                    <h2 className='text-lg font-bold text-gray-900 dark:text-slate-100'>All Analytics</h2>
                                </div>
                                <button
                                    onClick={() => setShowChartsModal(false)}
                                    className='w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1F242F] transition-colors cursor-pointer'
                                >
                                    <X className='w-5 h-5' />
                                </button>
                            </div>

                            {/* All charts grid */}
                            <div className='p-6 grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                {CHART_SLIDES.map((slide) => (
                                    <div key={slide.key} className='bg-gray-50 dark:bg-[#1F242F] rounded-xl ring-1 ring-gray-100 dark:ring-[#333741] p-4'>
                                        <h3 className='text-sm font-semibold text-gray-700 dark:text-slate-200 mb-3'>{slide.label}</h3>
                                        <div className='h-[280px]'>
                                            {React.createElement(slide.component)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NewDashboard
