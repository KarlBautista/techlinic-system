import NewNavigation from '../components/newNavigation.jsx'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import useAuth from '../store/useAuthStore';
import useData from '../store/useDataStore';
import useMedicine from '../store/useMedicineStore';
import { PageLoader } from '../components/PageLoader';

import Swal from "sweetalert2";
import { Link, useNavigate } from 'react-router-dom'

import AnimateNumber from "../components/AnimateNumber"

/* ───── Inline SVG Icons ───── */
const IconPatients = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
);
const IconVisits = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
);
const IconDiagnosis = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
    </svg>
);
const IconMedicine = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m20.893 13.393-1.135-1.135a2.252 2.252 0 0 1-.421-.585l-1.08-2.16a.414.414 0 0 0-.663-.107.827.827 0 0 1-.812.21l-1.273-.363a.89.89 0 0 0-.738 1.595l.587.39c.59.395.674 1.23.172 1.732l-.2.2c-.212.212-.33.498-.33.796v.41c0 .409-.11.809-.32 1.158l-1.315 2.191a2.11 2.11 0 0 1-1.81 1.025 1.055 1.055 0 0 1-1.055-1.055v-1.172c0-.92-.56-1.747-1.414-2.089l-.655-.261a2.25 2.25 0 0 1-1.383-2.46l.007-.042a2.25 2.25 0 0 1 .29-.787l.09-.15a2.25 2.25 0 0 1 2.37-1.048l1.178.236a1.125 1.125 0 0 0 1.302-.795l.208-.73a1.125 1.125 0 0 0-.578-1.315l-.665-.332-.091.091a2.25 2.25 0 0 1-1.591.659h-.18a.94.94 0 0 0-.662.274.931.931 0 0 1-1.458-1.137l1.411-2.353a2.25 2.25 0 0 0 .286-.76m11.928 9.869A9 9 0 0 0 8.965 3.525m11.928 9.868A9 9 0 1 1 8.965 3.525" />
    </svg>
);
const IconClock = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

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
        Swal.fire({
            title: "Awaiting Physician Assessment",
            text: "This patient is awaiting physician assessment; a formal diagnosis has not yet been provided.",
            icon: "info",
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

    /* ───── Stat card config ───── */
    const statCards = [
        {
            label: "Total Patients",
            value: patientsData?.length || 0,
            subtitle: "Registered patients",
            icon: <IconPatients />,
            color: "bg-rose-50 text-[#b01c34]",
        },
        {
            label: "Today's Visits",
            value: todayRecords.length,
            subtitle: `${pendingCount} pending · ${completedCount} completed`,
            icon: <IconVisits />,
            color: "bg-amber-50 text-amber-600",
        },
        {
            label: "Total Records",
            value: records?.length || 0,
            subtitle: "All-time clinic visits",
            icon: <IconDiagnosis />,
            color: "bg-emerald-50 text-emerald-600",
        },
        {
            label: "Medicine Stock",
            value: medicines?.length || 0,
            subtitle: "Items in inventory",
            icon: <IconMedicine />,
            color: "bg-blue-50 text-blue-600",
        },
    ];

    return (
        <div className='h-screen w-full flex flex-col sm:flex-row'>
            <div className='h-[8%] w-full order-last sm:order-0 sm:w-[20%] sm:h-full md:w-[16%] lg:w-[14%]'>
                <NewNavigation />
            </div>
            <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[80%] md:w-[84%] lg:w-[86%] overflow-auto p-6 flex flex-col gap-5'>
              {initialLoading ? (
                  <PageLoader message="Loading dashboard..." />
              ) : (
              <>
                {/* ─── Welcome Banner ─── */}
                <div className='w-full rounded-2xl bg-linear-to-r from-[#b01c34] to-[#d4375a] p-6 text-white shadow-lg'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm font-medium text-white/80'>{formatDate(new Date())}</p>
                            <h1 className='text-2xl font-bold mt-1'>
                                {getGreeting()}, {getUserRole() === "DOCTOR" ? "Dr. " : ""}{getDisplayName()}
                            </h1>
                            <div className='flex items-center gap-2 mt-2'>
                                <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm'>
                                    {getUserRole()}
                                </span>
                                {todayRecords.length > 0 && (
                                    <span className='text-sm text-white/80'>
                                        · {todayRecords.length} patient{todayRecords.length !== 1 ? 's' : ''} today
                                    </span>
                                )}
                            </div>
                        </div>
                        <Link
                            to='/notifications'
                            className='sm:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors'
                            title='Notifications'
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                            </svg>
                        </Link>
                    </div>
                </div>

                {/* ─── Quick Action Buttons ─── */}
                <div className='flex flex-wrap gap-3'>
                    <Link
                        to='/new-patient'
                        className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#b01c34] text-white text-sm font-medium hover:bg-[#8f1629] transition-colors shadow-sm'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        New Patient
                    </Link>
                    <Link
                        to='/patient-record'
                        className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm ring-1 ring-gray-200'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        View Records
                    </Link>
                    <Link
                        to='/medicine-inventory'
                        className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm ring-1 ring-gray-200'
                    >
                        <IconMedicine />
                        Inventory
                    </Link>
                </div>

                {/* ─── Stat Cards ─── */}
                <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                    {statCards.map((card, idx) => (
                        <div key={idx} className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex items-start gap-4'>
                            <div className={`shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${card.color}`}>
                                {card.icon}
                            </div>
                            <div className='min-w-0'>
                                <p className='text-xs font-medium text-gray-500 uppercase tracking-wide'>{card.label}</p>
                                <p className='text-2xl font-bold text-gray-900 mt-0.5'>
                                    <AnimateNumber value={card.value} />
                                </p>
                                <p className='text-xs text-gray-400 mt-0.5 truncate'>{card.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── Today's Records Table ─── */}
                <div className='bg-white rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden'>
                    {/* Table Header */}
                    <div className='px-5 py-4 flex items-center justify-between border-b border-gray-100'>
                        <div className='flex items-center gap-3'>
                            <h2 className='text-lg font-semibold text-gray-800'>Today's Records</h2>
                            <span className='inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-[#b01c34] text-white text-xs font-bold'>
                                {todayRecords.length}
                            </span>
                        </div>
                        {pendingCount > 0 && (
                            <span className='inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full'>
                                <span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse' />
                                {pendingCount} pending
                            </span>
                        )}
                    </div>

                    {/* Table Content */}
                    <div className='flex-1 overflow-auto'>
                        {todayRecords.length > 0 ? (
                            <table className='w-full'>
                                <thead className='sticky top-0 bg-gray-50/90 backdrop-blur-sm'>
                                    <tr>
                                        <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Student ID</th>
                                        <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Patient Name</th>
                                        <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell'>Department</th>
                                        <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell'>Diagnosis</th>
                                        <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell'>Time</th>
                                        <th className='text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3'>Status</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-50'>
                                    {todayRecords.map((patient) => (
                                        <tr
                                            key={patient.id}
                                            className='hover:bg-gray-50/60 cursor-pointer transition-colors group'
                                            onClick={
                                                patient.status === "INCOMPLETE" && userProfile?.role === "DOCTOR"
                                                    ? () => handleDiagnose(patient.id)
                                                    : patient.status === "INCOMPLETE" && userProfile?.role === "NURSE"
                                                        ? () => handleWaitingForDiagnosis()
                                                        : () => handleIndividualRecord(patient.student_id)
                                            }
                                        >
                                            <td className='px-5 py-3.5'>
                                                <span className='text-sm font-medium text-gray-900 group-hover:text-[#b01c34] transition-colors'>
                                                    {patient.student_id}
                                                </span>
                                            </td>
                                            <td className='px-5 py-3.5'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0'>
                                                        {patient.first_name?.[0]}{patient.last_name?.[0]}
                                                    </div>
                                                    <span className='text-sm text-gray-700 truncate'>{`${patient.first_name} ${patient.last_name}`}</span>
                                                </div>
                                            </td>
                                            <td className='px-5 py-3.5 hidden md:table-cell'>
                                                <span className='text-sm text-gray-600'>{patient.department}</span>
                                            </td>
                                            <td className='px-5 py-3.5 hidden lg:table-cell'>
                                                <span className='text-sm text-gray-600 truncate max-w-[200px] block'>
                                                    {patient.diagnoses[0]?.diagnosis || (
                                                        <span className='text-gray-400 italic'>Pending</span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className='px-5 py-3.5 hidden sm:table-cell'>
                                                <div className='flex items-center gap-1.5 text-gray-400'>
                                                    <IconClock />
                                                    <span className='text-xs'>{formatTime(patient.created_at)}</span>
                                                </div>
                                            </td>
                                            <td className='px-5 py-3.5'>
                                                {patient.status === "COMPLETE" ? (
                                                    <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700'>
                                                        <span className='w-1.5 h-1.5 rounded-full bg-emerald-500' />
                                                        Complete
                                                    </span>
                                                ) : (
                                                    <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700'>
                                                        <span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse' />
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className='flex flex-col items-center justify-center py-16 text-gray-400'>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375" />
                                </svg>
                                <p className='text-sm font-medium text-gray-500'>No records for today</p>
                                <p className='text-xs text-gray-400 mt-1'>Patient visits will appear here</p>
                                <Link
                                    to='/new-patient'
                                    className='mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#b01c34] hover:text-[#8f1629] transition-colors'
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Add first patient
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
              </>
              )}
            </div>
        </div>
    );
};

export default NewDashboard