import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    BarChart3,
    UserPlus,
    ClipboardList,
    Pill,
    Bell,
    Users,
    Settings,
    LogOut,
    ChevronsLeft,
    ChevronsRight,
    ScrollText,
    Moon,
    Sun,
    Shield,
    EllipsisVertical,
} from 'lucide-react'
import { showToast } from './Toast'
import { showModal } from './Modal'
import TUP from '../assets/image/TUP.png'
import useAuth from '../store/useAuthStore'
import useNotificationStore, { requestNotificationPermission } from '../store/useNotificationStore'
import NotificationModal from './NotificationModal'
import supabase from '../config/supabaseClient'

// ════════════════════════════════════════════════════════
// ── Nav Items Config ──
// ════════════════════════════════════════════════════════

const NAV_SECTIONS = {
    NURSE: [
        {
            title: 'Main',
            items: [
                { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            ],
        },
        {
            title: 'Management',
            items: [
                { label: 'New Patient', path: '/new-patient', icon: UserPlus },
                { label: 'Patient Record', path: '/patient-record', icon: ClipboardList, matchPrefix: ['/individual-record', '/add-diagnosis'] },
                { label: 'Medicine', path: '/medicine-inventory', icon: Pill, matchPrefix: ['/add-medicine'] },
            ],
        },
        {
            title: 'System',
            items: [
                { label: 'Activity Log', path: '/activity-log', icon: ScrollText },
                { label: 'Notifications', path: '/notifications', icon: Bell, hasBadge: true },
            ],
        },
    ],
    DOCTOR: [
        {
            title: 'Main',
            items: [
                { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            ],
        },
        {
            title: 'Management',
            items: [
                { label: 'Patient Record', path: '/patient-record', icon: ClipboardList, matchPrefix: ['/individual-record', '/add-diagnosis'] },
                { label: 'Medicine', path: '/medicine-inventory', icon: Pill, matchPrefix: ['/add-medicine'] },
            ],
        },
        {
            title: 'System',
            items: [
                { label: 'Activity Log', path: '/activity-log', icon: ScrollText },
                { label: 'Notifications', path: '/notifications', icon: Bell, hasBadge: true },
            ],
        },
    ],
    ADMIN: [
        {
            title: 'Main',
            items: [
                { label: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
            ],
        },
        {
            title: 'Management',
            items: [
                { label: 'Personnel', path: '/personnel-list', icon: Users },
                { label: 'Patient Record', path: '/patient-record', icon: ClipboardList, matchPrefix: ['/individual-record'] },
                { label: 'Medicine', path: '/medicine-inventory', icon: Pill },
            ],
        },
        {
            title: 'System',
            items: [
                { label: 'Activity Log', path: '/activity-log', icon: ScrollText },
                { label: 'Notifications', path: '/notifications', icon: Bell, hasBadge: true },
            ],
        },
    ],
}

// ── Mobile bottom nav (shared between roles, simplified) ──
const MOBILE_NAV = {
    NURSE: [
        { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
        { label: 'New', path: '/new-patient', icon: UserPlus },
        { label: 'Records', path: '/patient-record', icon: ClipboardList },
        { label: 'Meds', path: '/medicine-inventory', icon: Pill },
        { label: 'More', path: '/notifications', icon: Bell, hasBadge: true },
    ],
    DOCTOR: [
        { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Records', path: '/patient-record', icon: ClipboardList },
        { label: 'Meds', path: '/medicine-inventory', icon: Pill },
        { label: 'More', path: '/notifications', icon: Bell, hasBadge: true },
    ],
    ADMIN: [
        { label: 'Home', path: '/admin-dashboard', icon: Shield },
        { label: 'Team', path: '/personnel-list', icon: Users },
        { label: 'Records', path: '/patient-record', icon: ClipboardList },
        { label: 'Meds', path: '/medicine-inventory', icon: Pill },
        { label: 'More', path: '/notifications', icon: Bell, hasBadge: true },
    ],
}

// ════════════════════════════════════════════════════════
// ── Tooltip Component ──
// ════════════════════════════════════════════════════════

function NavTooltip({ children, label, show }) {
    return (
        <div className="relative group/tooltip">
            {children}
            {show && (
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150">
                    <div className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                        {label}
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                </div>
            )}
        </div>
    )
}

// ════════════════════════════════════════════════════════
// ── Sidebar Component ──
// ════════════════════════════════════════════════════════

export default function Sidebar() {
    const { authenticatedUser, userProfile, signOut } = useAuth()
    const { unreadCount, fetchNotifications, checkForAlerts } = useNotificationStore()
    const location = useLocation()
    const navigate = useNavigate()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showMobileActions, setShowMobileActions] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const profileRef = useRef(null)
    const mobileActionsRef = useRef(null)

    // ── Collapse state (persisted) ──
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('tc-sidebar-collapsed')
        return saved === 'true'
    })

    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('tc-theme') || localStorage.getItem('tc-dashboard-theme')
        if (saved === 'dark') return true
        if (saved === 'light') return false
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    const toggleCollapse = () => {
        setCollapsed(prev => {
            localStorage.setItem('tc-sidebar-collapsed', String(!prev))
            return !prev
        })
    }

    useEffect(() => {
        localStorage.setItem('tc-theme', isDarkMode ? 'dark' : 'light')
        document.body.classList.add('theme-transition')
        document.body.classList.toggle('dark', isDarkMode)
        const timeout = setTimeout(() => {
            document.body.classList.remove('theme-transition')
        }, 350)
        return () => clearTimeout(timeout)
    }, [isDarkMode])

    // ── Close profile menu on outside click ──
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfileMenu(false)
            }
            if (mobileActionsRef.current && !mobileActionsRef.current.contains(e.target)) {
                setShowMobileActions(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // ── Notification realtime ──
    useEffect(() => {
        if (!authenticatedUser?.id) return
        requestNotificationPermission()
        fetchNotifications()

        const channel = supabase
            .channel('sidebar-notifications')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
                checkForAlerts()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authenticatedUser?.id])

    // ── Helpers ──
    const role = userProfile?.role || 'NURSE'
    const sections = NAV_SECTIONS[role] || NAV_SECTIONS.NURSE
    const mobileItems = MOBILE_NAV[role] || MOBILE_NAV.NURSE

    const isActive = (item) => {
        if (location.pathname === item.path) return true
        if (item.matchPrefix) {
            return item.matchPrefix.some(prefix => location.pathname.startsWith(prefix))
        }
        return false
    }

    const getDisplayName = () => {
        if (userProfile?.first_name && userProfile?.last_name) {
            return `${userProfile.first_name} ${userProfile.last_name}`
        }
        if (authenticatedUser?.user_metadata?.full_name) return authenticatedUser.user_metadata.full_name
        if (authenticatedUser?.email) return authenticatedUser.email.split('@')[0]
        return 'User'
    }

    const getInitials = () => {
        const name = getDisplayName().trim()
        if (!name) return 'U'
        const parts = name.split(' ').filter(Boolean)
        if (parts.length === 1) return parts[0][0].toUpperCase()
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }

    const handleSignOut = async () => {
        const confirmed = await showModal({
            type: 'warning',
            title: 'Sign Out?',
            message: 'Are you sure you want to sign out?',
            confirmLabel: 'Yes, sign out',
            cancelLabel: 'Cancel',
        })
        if (!confirmed) return

        const response = await signOut()
        if (response?.error) {
            showToast({ title: 'Error', message: "Can't sign out. Please try again.", type: 'error' })
            return
        }
        showToast({ title: 'Signed Out', message: 'Thank you for choosing TechClinic.', type: 'success' })
        navigate('/login', { replace: true })
        setTimeout(() => { window.location.href = '/login' }, 100)
    }

    // ════════════════════════════════════════════════════
    // ── Render ──
    // ════════════════════════════════════════════════════

    return (
        <>
            {/* ═══ Desktop Sidebar ═══ */}
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 72 : 256 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="hidden sm:flex flex-col h-full bg-gray-50 dark:bg-[#0C111D] border-r border-gray-200 dark:border-[#1F2A37] relative z-30 overflow-visible"
            >
                {/* ── Logo ── */}
                <div className={`flex items-center gap-3 h-16 border-b border-gray-200 dark:border-[#1F2A37] shrink-0 transition-all duration-300 ${collapsed ? 'px-2 justify-center' : 'px-4'}`}>
                    <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                        <img src={TUP} className="w-full h-full object-contain" alt="TUP" />
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                                className="flex flex-col min-w-0"
                            >
                                <span className="text-crimson-600 dark:text-white font-bold text-sm leading-tight tracking-tight">TechClinic</span>
                                <span className="text-gray-400 dark:text-[#94969C] text-[0.6rem] font-medium truncate">Electronic Medical Record</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {!collapsed && (
                        <button
                            type="button"
                            onClick={() => setIsDarkMode(prev => !prev)}
                            className="ml-auto inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-[#1F2A37] text-gray-500 dark:text-[#94969C] hover:bg-gray-50 dark:hover:bg-[#1F242F] transition-colors h-9 w-9"
                            aria-label="Toggle dark mode"
                            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                    )}
                </div>
                {/* ── Collapsed dark mode toggle ── */}
                {collapsed && (
                    <div className="flex justify-center py-2 border-b border-gray-200 dark:border-[#1F2A37]">
                        <button
                            type="button"
                            onClick={() => setIsDarkMode(prev => !prev)}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-[#1F2A37] text-gray-500 dark:text-[#94969C] hover:bg-gray-50 dark:hover:bg-[#1F242F] transition-colors h-8 w-8"
                            aria-label="Toggle dark mode"
                            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                        </button>
                    </div>
                )}

                {/* ── Nav Sections ── */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-3 scrollbar-thin">
                    {sections.map((section, sIdx) => (
                        <div key={section.title} className={sIdx > 0 ? 'mt-5' : ''}>
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-[0.65rem] font-semibold text-gray-400 dark:text-[#94969C] uppercase tracking-wider px-2 mb-1.5"
                                    >
                                        {section.title}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                            {collapsed && sIdx > 0 && (
                                <div className="w-6 h-px bg-gray-200 dark:bg-[#1F2A37] mx-auto mb-2" />
                            )}
                            <div className="flex flex-col gap-0.5">
                                {section.items.map((item) => {
                                    const active = isActive(item)
                                    const Icon = item.icon
                                    const isNotification = item.hasBadge && item.label === 'Notifications'
                                    const Wrapper = isNotification ? 'button' : Link
                                    const wrapperProps = isNotification
                                        ? { onClick: () => setShowNotifications(true) }
                                        : { to: item.path }
                                    return (
                                        <NavTooltip key={item.path} label={item.label} show={collapsed}>
                                            <Wrapper
                                                {...wrapperProps}
                                                className={`
                                                    relative flex items-center gap-3 rounded-xl transition-all duration-200 group w-full text-left
                                                    ${collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3 py-2.5'}
                                                    ${active && !isNotification
                                                        ? collapsed
                                                            ? 'bg-crimson-600 text-white dark:bg-[#1F242F] dark:text-white'
                                                            : 'bg-crimson-50 text-crimson-600 dark:bg-[#1F242F] dark:text-white dark:ring-1 dark:ring-[#333741]'
                                                        : 'text-gray-500 dark:text-[#94969C] hover:bg-white dark:hover:bg-[#1F242F] hover:text-gray-800 dark:hover:text-white'
                                                    }
                                                `}
                                            >
                                                {/* Active indicator bar */}
                                                {active && !collapsed && (
                                                    <motion.div
                                                        layoutId="sidebar-active"
                                                        className={`absolute left-0 top-1 bottom-1 w-[3px] bg-crimson-600 dark:bg-white rounded-r-full`}
                                                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                                    />
                                                )}
                                                <div className="relative shrink-0">
                                                    <Icon
                                                        size={collapsed ? 20 : 18}
                                                        strokeWidth={active ? 2.2 : 1.8}
                                                        className="transition-all duration-200"
                                                    />
                                                    {/* Notification badge (on icon) */}
                                                    {item.hasBadge && unreadCount > 0 && (
                                                        <span className="absolute -top-1.5 -right-1.5 bg-crimson-600 dark:bg-crimson-500 text-white text-[0.55rem] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white dark:ring-[#0C111D]">
                                                            {unreadCount > 9 ? '9+' : unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                                <AnimatePresence>
                                                    {!collapsed && (
                                                        <motion.span
                                                            initial={{ opacity: 0, x: -8 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -8 }}
                                                            transition={{ duration: 0.15 }}
                                                            className={`text-[0.82rem] font-medium truncate ${active ? 'font-semibold' : ''}`}
                                                        >
                                                            {item.label}
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </Wrapper>
                                        </NavTooltip>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Collapse Toggle ── */}
                <div className="px-3 py-2 border-t border-gray-200 dark:border-[#1F2A37]">
                    <button
                        onClick={toggleCollapse}
                        className={`
                            flex items-center gap-3 w-full rounded-xl text-gray-400 dark:text-[#94969C] hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F242F] transition-all duration-300 cursor-pointer
                            ${collapsed ? 'justify-center h-10' : 'px-3 py-2.5'}
                        `}
                    >
                        {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-xs font-medium"
                                >
                                    Collapse
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>

                {/* ── User Profile ── */}
                <div className="border-t border-gray-200 dark:border-[#1F2A37] relative" ref={profileRef}>
                    <button
                        onClick={() => setShowProfileMenu(prev => !prev)}
                        className={`
                            w-full flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#1F242F] transition-all duration-300 cursor-pointer
                            ${collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'}
                        `}
                    >
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-crimson-600 to-crimson-400 flex items-center justify-center shrink-0 shadow-sm">
                            <span className="text-white text-xs font-bold">{getInitials()}</span>
                        </div>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="min-w-0 flex-1 text-left"
                                >
                                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate leading-tight">
                                        {role === 'DOCTOR' ? 'Dr. ' : ''}{getDisplayName()}
                                    </p>
                                    <p className="text-[0.65rem] text-gray-400 dark:text-[#94969C] font-medium">
                                        {role === 'DOCTOR' ? 'Physician' : role === 'ADMIN' ? 'Administrator' : 'Personnel'}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>

                    {/* Profile Popover */}
                    <AnimatePresence>
                        {showProfileMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className={`absolute bottom-full mb-2 bg-white dark:bg-[#161B26] rounded-xl shadow-lg ring-1 ring-gray-200/80 dark:ring-[#1F2A37] py-1 z-50 ${collapsed ? 'left-full ml-2 w-56' : 'left-2 right-2'
                                    }`}
                            >
                                {/* User info in popover */}
                                <div className="px-3 py-2.5 border-b border-gray-100 dark:border-[#1F2A37]">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                        {role === 'DOCTOR' ? 'Dr. ' : ''}{getDisplayName()}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-[#94969C]">{authenticatedUser?.email}</p>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={() => { navigate('/settings'); setShowProfileMenu(false) }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 dark:text-[#94969C] hover:bg-gray-50 dark:hover:bg-[#1F242F] hover:text-crimson-600 dark:hover:text-white transition-colors cursor-pointer"
                                    >
                                        <Settings size={15} strokeWidth={1.8} />
                                        Settings
                                    </button>
                                    <button
                                        onClick={() => { handleSignOut(); setShowProfileMenu(false) }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 dark:text-[#94969C] hover:bg-red-50 dark:hover:bg-[#2C1418] hover:text-crimson-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                                    >
                                        <LogOut size={15} strokeWidth={1.8} />
                                        Sign out
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.aside>

            {/* ═══ Mobile Top Bar ═══ */}
            <header className="sm:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-[#0C111D] border-b border-gray-100 dark:border-[#1F2A37]">
                <div className="h-14 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <img src={TUP} className="w-8 h-8 object-contain shrink-0" alt="TUP" />
                        <div className="min-w-0">
                            <p className="text-[#b01c34] dark:text-white font-bold text-sm leading-tight tracking-tight truncate">TechClinic</p>
                            <p className="text-gray-400 dark:text-[#94969C] text-[0.62rem] font-medium truncate">Electronic Medical Record</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2" ref={mobileActionsRef}>
                        <button
                            type="button"
                            onClick={() => setIsDarkMode(prev => !prev)}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-[#1F2A37] text-gray-500 dark:text-[#94969C] hover:bg-gray-50 dark:hover:bg-[#1F242F] transition-colors h-8 w-8"
                            aria-label="Toggle dark mode"
                            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowMobileActions(prev => !prev)}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-[#1F2A37] text-gray-500 dark:text-[#94969C] hover:bg-gray-50 dark:hover:bg-[#1F242F] transition-colors h-8 w-8"
                            aria-label="Open quick actions"
                            title="Quick actions"
                        >
                            <EllipsisVertical size={14} />
                        </button>

                        <AnimatePresence>
                            {showMobileActions && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-[3.4rem] right-4 min-w-[160px] bg-white dark:bg-[#161B26] ring-1 ring-gray-200 dark:ring-[#1F2A37] rounded-xl shadow-lg p-1.5"
                                >
                                    <button
                                        type="button"
                                        onClick={() => { setShowMobileActions(false); navigate('/settings') }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-[#94969C] hover:bg-gray-50 dark:hover:bg-[#1F242F] hover:text-crimson-600 dark:hover:text-white transition-colors"
                                    >
                                        <Settings size={14} />
                                        Settings
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowMobileActions(false); handleSignOut() }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-[#2C1418] transition-colors"
                                    >
                                        <LogOut size={14} />
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* ═══ Mobile Bottom Nav ═══ */}
            <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#0C111D] border-t border-gray-100 dark:border-[#1F2A37] safe-area-pb">
                <div className="flex items-center justify-around h-16 px-1">
                    {mobileItems.map((item) => {
                        const active = isActive(item)
                        const Icon = item.icon
                        const isMobileNotif = item.hasBadge && item.label === 'More'
                        const MobileWrapper = isMobileNotif ? 'button' : Link
                        const mobileWrapperProps = isMobileNotif
                            ? { onClick: () => setShowNotifications(true) }
                            : { to: item.path }
                        return (
                            <MobileWrapper
                                key={item.path}
                                {...mobileWrapperProps}
                                className={`
                                    relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors
                                    ${active && !isMobileNotif ? 'text-crimson-600 dark:text-white' : 'text-gray-400 dark:text-[#94969C]'}
                                `}
                            >
                                {active && !isMobileNotif && (
                                    <motion.div
                                        layoutId="mobile-active"
                                        className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-crimson-600 dark:bg-white rounded-b-full"
                                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                    />
                                )}
                                <div className="relative">
                                    <Icon size={20} strokeWidth={active && !isMobileNotif ? 2.2 : 1.6} />
                                    {item.hasBadge && unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1.5 bg-crimson-600 dark:bg-crimson-500 text-white text-[0.5rem] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center ring-2 ring-white dark:ring-[#0C111D]">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[0.6rem] font-medium ${active && !isMobileNotif ? 'font-semibold' : ''}`}>
                                    {item.label}
                                </span>
                            </MobileWrapper>
                        )
                    })}
                </div>
            </nav>

            <NotificationModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        </>
    )
}
