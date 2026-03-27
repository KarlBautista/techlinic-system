import React, { useEffect, useRef, useState, useMemo } from 'react'
import useAuth from '../store/useAuthStore';
import useData from '../store/useDataStore';
import useMedicine from '../store/useMedicineStore';
import { motion, AnimatePresence } from 'framer-motion';

import { showToast } from '../components/Toast';
import { Link, useNavigate } from 'react-router-dom'

import AnimateNumber from "../components/AnimateNumber"
import {
    Users, CalendarDays, ClipboardCheck, Pill,
    Clock, Plus, Search, ArrowRight, Activity, TrendingUp,
    ChevronRight, ChevronLeft
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

const NewDashboard = () => {
    const { authenticatedUser, userProfile } = useAuth();
    const { patientRecords, patientsData, getRecords } = useData();
    const records = patientRecords?.data ?? [];
    const { medicines, getMedicines } = useMedicine();
    const navigate = useNavigate();
    const refreshIntervalRef = useRef(null);
    const [initialLoading, setInitialLoading] = useState(true);

    // Auto-refresh data every 15 seconds
    useEffect(() => {
        const fetchData = async () => {
            try {
                await getRecords();
                await getMedicines();
            } catch (err) {
                console.error('Error auto-refreshing data:', err);
            }
        };

        fetchData().finally(() => setInitialLoading(false));

        refreshIntervalRef.current = setInterval(() => {
            fetchData();
        }, 15000);

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [getRecords, getMedicines]);

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

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
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
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const ROWS_OPTIONS = [5, 10, 20, 50];

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
    }, [rowsPerPage, tableFilter]);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    function formatDateShort(dateString) {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    /* ───── Stat card config ───── */
    const statCards = [
        {
            label: "Total Patients",
            value: patientsData?.length || 0,
            subtitle: "Registered patients",
            icon: <Users className="w-5 h-5" />,
            iconBg: "bg-crimson-50 dark:bg-transparent",
            iconColor: "text-crimson-600 dark:text-crimson-300",
            ring: "ring-crimson-100 dark:ring-gray-700",
        },
        {
            label: "Today's Visits",
            value: todayRecords.length,
            subtitle: `${pendingCount} pending · ${completedCount} completed`,
            icon: <CalendarDays className="w-5 h-5" />,
            iconBg: "bg-amber-50 dark:bg-transparent",
            iconColor: "text-amber-600 dark:text-amber-300",
            ring: "ring-amber-100 dark:ring-gray-700",
        },
        {
            label: "Total Records",
            value: records?.length || 0,
            subtitle: "All-time clinic visits",
            icon: <ClipboardCheck className="w-5 h-5" />,
            iconBg: "bg-emerald-50 dark:bg-transparent",
            iconColor: "text-emerald-600 dark:text-emerald-300",
            ring: "ring-emerald-100 dark:ring-gray-700",
        },
        {
            label: "Medicine Stock",
            value: medicines?.length || 0,
            subtitle: "Items in inventory",
            icon: <Pill className="w-5 h-5" />,
            iconBg: "bg-blue-50 dark:bg-transparent",
            iconColor: "text-blue-600 dark:text-crimson-300",
            ring: "ring-blue-100 dark:ring-gray-700",
        },
    ];

    return (
        <div className='flex flex-col gap-5'>
            {initialLoading ? (
                <div className='flex flex-col gap-5 animate-pulse'>
                    {/* Skeleton Welcome Banner */}
                    <div className='w-full rounded-2xl bg-gray-200 dark:bg-[#1F242F] p-6 sm:p-8 h-36' />
                    {/* Skeleton Quick Actions */}
                    <div className='flex flex-wrap gap-3'>
                        <div className='h-10 w-32 bg-gray-200 dark:bg-[#1F242F] rounded-xl' />
                        <div className='h-10 w-32 bg-gray-200 dark:bg-[#1F242F] rounded-xl' />
                        <div className='h-10 w-28 bg-gray-200 dark:bg-[#1F242F] rounded-xl' />
                    </div>
                    {/* Skeleton Stat Cards */}
                    <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className='bg-white dark:bg-[#161B26] rounded-xl ring-1 ring-gray-100 dark:ring-[#1F2A37] p-5 flex items-start gap-4'>
                                <div className='w-11 h-11 rounded-xl bg-gray-200 dark:bg-[#1F242F] shrink-0' />
                                <div className='flex-1'>
                                    <div className='h-3 w-20 bg-gray-200 dark:bg-[#1F242F] rounded' />
                                    <div className='h-7 w-16 bg-gray-200 dark:bg-[#1F242F] rounded mt-2' />
                                    <div className='h-3 w-28 bg-gray-100 dark:bg-[#1F242F] rounded mt-2' />
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Skeleton Table */}
                    <div className='bg-white dark:bg-[#161B26] rounded-xl ring-1 ring-gray-100 dark:ring-[#1F2A37] overflow-hidden'>
                        <div className='px-5 py-4 border-b border-gray-100 dark:border-[#1F2A37] flex items-center gap-3'>
                            <div className='h-5 w-32 bg-gray-200 dark:bg-[#1F242F] rounded' />
                            <div className='h-6 w-8 bg-gray-200 dark:bg-[#1F242F] rounded-full' />
                        </div>
                        <div className='px-5 py-3 flex gap-4 border-b border-gray-100 dark:border-[#1F2A37]'>
                            {[80, 120, 130, 100, 60, 70].map((w, i) => (
                                <div key={i} className='h-4 bg-gray-200 dark:bg-[#1F242F] rounded' style={{ width: w }} />
                            ))}
                        </div>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className='px-5 py-4 flex items-center gap-4 border-b border-gray-50 dark:border-[#1F2A37]'>
                                <div className='h-4 w-20 bg-gray-100 dark:bg-[#1F242F] rounded' />
                                <div className='flex items-center gap-3'>
                                    <div className='w-8 h-8 rounded-full bg-gray-200 dark:bg-[#1F242F]' />
                                    <div className='h-4 w-28 bg-gray-100 dark:bg-[#1F242F] rounded' />
                                </div>
                                <div className='h-4 w-32 bg-gray-100 dark:bg-[#1F242F] rounded hidden md:block' />
                                <div className='h-4 w-24 bg-gray-100 dark:bg-[#1F242F] rounded hidden lg:block' />
                                <div className='h-4 w-16 bg-gray-100 dark:bg-[#1F242F] rounded hidden sm:block' />
                                <div className='h-6 w-16 bg-gray-100 dark:bg-[#1F242F] rounded-full' />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-5"
                >
                    {/* ─── Welcome Banner ─── */}
                    <motion.div
                        variants={itemVariants}
                        className='w-full rounded-2xl bg-linear-to-br from-crimson-700 via-crimson-600 to-crimson-500 dark:from-[#0C111D] dark:via-[#161B26] dark:to-[#1F242F] p-6 sm:p-8 text-white shadow-lg relative overflow-hidden ring-1 ring-white/10 dark:ring-gray-600/20'
                    >
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 dark:bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 dark:bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

                        <div className='flex items-start justify-between gap-4 relative z-10'>
                            <div>
                                <div className='flex items-center gap-2 mb-1'>
                                    <Activity className="w-4 h-4 text-white/60 dark:text-gray-300" />
                                    <p className='text-sm font-medium text-white/70 dark:text-gray-300'>{formatDate(new Date())}</p>
                                </div>
                                <h1 className='text-2xl sm:text-3xl font-bold mt-1 tracking-tight'>
                                    {getGreeting()}, {getUserRole() === "DOCTOR" ? "Dr. " : ""}{getDisplayName()}
                                </h1>
                                <div className='flex items-center gap-2 mt-3'>
                                    <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 dark:bg-[#1F242F]/85 text-white dark:text-gray-200 backdrop-blur-sm border border-white/10 dark:border-gray-600/35'>
                                        {getUserRole()}
                                    </span>
                                    {todayRecords.length > 0 && (
                                        <span className='inline-flex items-center gap-1.5 text-sm text-white/80 dark:text-gray-300'>
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            {todayRecords.length} patient{todayRecords.length !== 1 ? 's' : ''} today
                                        </span>
                                    )}
                                </div>
                            </div>

                        </div>
                    </motion.div>

                    {/* ─── Quick Action Buttons ─── */}
                    <motion.div variants={itemVariants} className='flex flex-wrap gap-3'>
                        <Link
                            to='/new-patient'
                            className='group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-crimson-600 dark:bg-crimson-600 text-white text-sm font-medium hover:bg-crimson-700 dark:hover:bg-crimson-500 transition-all shadow-sm hover:shadow-md'
                        >
                            <Plus className="w-4 h-4" />
                            New Patient
                            <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </Link>
                        <Link
                            to='/patient-record'
                            className='group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-[#161B26] text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#1F242F] transition-all shadow-sm ring-1 ring-gray-200 dark:ring-[#333741] hover:ring-crimson-200 dark:hover:ring-gray-500/70 hover:text-crimson-700 dark:hover:text-gray-200'
                        >
                            <Search className="w-4 h-4" />
                            View Records
                        </Link>
                        <Link
                            to='/medicine-inventory'
                            className='group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-[#161B26] text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#1F242F] transition-all shadow-sm ring-1 ring-gray-200 dark:ring-[#333741] hover:ring-crimson-200 dark:hover:ring-gray-500/70 hover:text-crimson-700 dark:hover:text-gray-200'
                        >
                            <Pill className="w-4 h-4" />
                            Inventory
                        </Link>
                    </motion.div>

                    {/* ─── Stat Cards ─── */}
                    <motion.div variants={itemVariants} className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                        {statCards.map((card, idx) => (
                            <motion.div
                                key={idx}
                                variants={cardHover}
                                initial="rest"
                                whileHover="hover"
                                className={`bg-white dark:bg-[#161B26] rounded-xl shadow-sm p-5 flex items-start gap-4 ring-1 ${card.ring} cursor-default`}
                            >
                                <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${card.iconBg} ${card.iconColor}`}>
                                    {card.icon}
                                </div>
                                <div className='min-w-0'>
                                    <p className='text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide'>{card.label}</p>
                                    <p className='text-2xl font-bold text-gray-900 dark:text-slate-100 mt-0.5 tabular-nums'>
                                        <AnimateNumber value={card.value} />
                                    </p>
                                    <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate'>{card.subtitle}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* ─── Records Table with Filters ─── */}

                    {/* Filter Tabs */}
                    <motion.div variants={itemVariants} className='flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-fit'>
                        <button
                            onClick={() => setTableFilter('today')}
                            className={`px-4 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${tableFilter === 'today' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setTableFilter('pending')}
                            className={`px-4 py-2 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${tableFilter === 'pending' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Pending
                            {pendingRecords.length > 0 && tableFilter !== 'pending' && (
                                <span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse' />
                            )}
                        </button>
                    </motion.div>

                    {/* Table */}
                    <motion.div
                        variants={itemVariants}
                        className='bg-white dark:bg-[#161B26] rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden ring-1 ring-gray-100 dark:ring-[#1F2A37]'
                    >
                        {/* Table Header */}
                        <div className='px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-[#1F2A37]'>
                            <div className='flex items-center gap-3'>
                                <h2 className='text-lg font-semibold text-gray-800 dark:text-slate-100'>Today's Records</h2>
                                <span className='inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-crimson-600 dark:bg-crimson-600 text-white text-xs font-bold'>
                                    {todayRecords.length}
                                </span>
                            </div>
                            {pendingCount > 0 && (
                                <span className='inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full ring-1 ring-transparent dark:ring-amber-900/50'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse' />
                                    {pendingCount} pending
                                </span>
                            )}
                        </div>

                        {/* Table Content */}
                        <div className='flex-1 overflow-auto'>
                            {todayRecords.length > 0 ? (
                                <table className='w-full'>
                                    <thead className='sticky top-0 bg-gray-50/95 dark:bg-[#1F242F]/95 backdrop-blur-sm'>
                                        <tr>
                                            <th className='text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3'>Patient ID</th>
                                            <th className='text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3'>Patient Name</th>
                                            <th className='text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell'>Department</th>
                                            <th className='text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3 hidden lg:table-cell'>Diagnosis</th>
                                            <th className='text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell'>Time</th>
                                            <th className='text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-5 py-3'>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-gray-50 dark:divide-[#1F2A37]'>
                                        {todayRecords.map((patient, idx) => (
                                            <motion.tr
                                                key={patient.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.03, duration: 0.3 }}
                                                className='hover:bg-crimson-50/40 dark:hover:bg-[#1F242F] cursor-pointer transition-colors group'
                                                onClick={
                                                    patient.status === "INCOMPLETE" && userProfile?.role === "DOCTOR"
                                                        ? () => handleDiagnose(patient.id)
                                                        : patient.status === "INCOMPLETE" && userProfile?.role === "NURSE"
                                                            ? () => handleWaitingForDiagnosis()
                                                            : () => handleIndividualRecord(patient.student_id)
                                                }
                                            >
                                                <td className='px-5 py-3.5'>
                                                    <span className='text-sm font-mono font-medium text-gray-900 dark:text-slate-100 group-hover:text-crimson-600 dark:group-hover:text-crimson-300 transition-colors'>
                                                        {patient.student_id}
                                                    </span>
                                                </td>
                                                <td className='px-5 py-3.5'>
                                                    <div className='flex items-center gap-3'>
                                                        <div className='w-8 h-8 rounded-full bg-linear-to-br from-crimson-100 to-crimson-50 dark:from-[#293040] dark:to-[#1F242F] flex items-center justify-center text-xs font-bold text-crimson-600 dark:text-gray-300 shrink-0 ring-1 ring-crimson-100 dark:ring-gray-700'>
                                                            {patient.first_name?.[0]}{patient.last_name?.[0]}
                                                        </div>
                                                        <span className='text-sm text-gray-700 dark:text-slate-200 truncate font-medium'>{`${patient.first_name} ${patient.last_name}`}</span>
                                                    </div>
                                                </td>
                                                <td className='px-5 py-3.5 hidden md:table-cell'>
                                                    <span className='text-sm text-gray-600 dark:text-slate-300'>{patient.department}</span>
                                                </td>
                                                <td className='px-5 py-3.5 hidden lg:table-cell'>
                                                    <span className='text-sm text-gray-600 dark:text-slate-300 truncate max-w-[200px] block'>
                                                        {patient.diagnoses[0]?.diagnosis || (
                                                            <span className='text-gray-400 dark:text-gray-500 italic'>Pending</span>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className='px-5 py-3.5 hidden sm:table-cell'>
                                                    <div className='flex items-center gap-1.5 text-gray-400 dark:text-gray-500'>
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span className='text-xs font-medium'>{formatTime(patient.created_at)}</span>
                                                    </div>
                                                </td>
                                                <td className='px-5 py-3.5'>
                                                    {patient.status === "COMPLETE" ? (
                                                        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-100 dark:ring-emerald-900/60'>
                                                            <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400' />
                                                            Complete
                                                        </span>
                                                    ) : (
                                                        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-1 ring-amber-100 dark:ring-amber-900/60'>
                                                            <span className='w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse' />
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className='px-3 py-3.5'>
                                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-crimson-500 group-hover:translate-x-0.5 transition-all" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className='flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500'>
                                    <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#1F242F] flex items-center justify-center mb-4">
                                        <ClipboardCheck className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                                    </div>
                                    <p className='text-sm font-medium text-gray-500 dark:text-slate-300'>No records for today</p>
                                    <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>Patient visits will appear here</p>
                                    <Link
                                        to='/new-patient'
                                        className='mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-crimson-600 dark:text-crimson-300 hover:text-crimson-700 dark:hover:text-gray-200 transition-colors group'
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add first patient
                                        <ArrowRight className="w-3.5 h-3.5 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 0 && (
                            <div className='flex items-center justify-between px-5 py-3 border-t border-gray-100'>
                                <span className='text-xs text-gray-500 font-medium'>
                                    Total Records: {filteredTableRecords.length}
                                </span>

                                <div className='flex items-center gap-1'>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-crimson-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer'
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>

                                    {getPageNumbers().map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer
                                                ${currentPage === page
                                                    ? 'bg-crimson-600 text-white shadow-sm'
                                                    : 'text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-crimson-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer'
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className='flex items-center gap-2'>
                                    <span className='text-xs text-gray-500 font-medium'>Show per Page:</span>
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => setRowsPerPage(Number(e.target.value))}
                                        className='h-8 px-2 rounded-lg bg-white ring-1 ring-gray-200 outline-none text-xs font-medium text-gray-600 focus:ring-crimson-400 transition-all cursor-pointer'
                                    >
                                        {ROWS_OPTIONS.map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default NewDashboard
