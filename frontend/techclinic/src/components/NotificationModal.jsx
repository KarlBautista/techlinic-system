import React, { useEffect, useState, useMemo } from 'react'
import { showToast } from './Toast'
import useNotificationStore, { requestNotificationPermission } from '../store/useNotificationStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, AlertTriangle, Pill, Info, Trash2, X, CheckCheck, Search } from 'lucide-react'

const getNotifCategory = (title = '') => {
    const t = title.toLowerCase()
    if (t.includes('disease')) return 'alerts'
    if (t.includes('stock') || t.includes('medicine') || t.includes('inventory') || t.includes('low stock')) return 'medicine'
    return 'system'
}

const getNotifStyle = (title = '') => {
    const cat = getNotifCategory(title)
    if (cat === 'alerts')
        return { Icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200', dot: 'bg-emerald-500' }
    if (cat === 'medicine')
        return { Icon: Pill, color: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-200', dot: 'bg-emerald-500' }
    return { Icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200', dot: 'bg-emerald-500' }
}

// eslint-disable-next-line no-misleading-character-class
const cleanTitle = (title) => title?.replace(/[\u{1F600}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}]/gu, '').trim() || title

const formatRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    const day = date.toLocaleDateString('en-US', { weekday: 'long' })
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    return `${day} ${time}`
}

const TABS = [
    { key: 'all', label: 'View all' },
    { key: 'unread', label: 'Unread' },
    { key: 'alerts', label: 'Disease Alerts' },
    { key: 'medicine', label: 'Medicine Alerts' },
]

const NotificationModal = ({ isOpen, onClose }) => {
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications
    } = useNotificationStore()

    const [confirmClear, setConfirmClear] = useState(false)
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (isOpen) {
            requestNotificationPermission()
            fetchNotifications(true)
        }
        if (!isOpen) {
            setActiveTab('all')
            setSearchQuery('')
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        const handleKey = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    const categoryCounts = useMemo(() => {
        const counts = { all: notifications.length, unread: 0, alerts: 0, medicine: 0, system: 0 }
        notifications.forEach(n => {
            const cat = getNotifCategory(n.title)
            counts[cat]++
            if (!n.is_read) counts.unread++
        })
        return counts
    }, [notifications])

    const filteredNotifications = useMemo(() => {
        let filtered = notifications
        if (activeTab === 'unread') {
            filtered = filtered.filter(n => !n.is_read)
        } else if (activeTab !== 'all') {
            filtered = filtered.filter(n => getNotifCategory(n.title) === activeTab)
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase()
            filtered = filtered.filter(n =>
                (n.title && n.title.toLowerCase().includes(q)) ||
                (n.message && n.message.toLowerCase().includes(q))
            )
        }
        return filtered
    }, [notifications, activeTab, searchQuery])

    const handleMarkAsRead = async (notificationId) => {
        await markAsRead(notificationId)
    }

    const handleDeleteNotification = async (notificationId) => {
        const result = await deleteNotification(notificationId)
        if (result?.success) {
            showToast({ title: 'Notification deleted', message: 'The notification has been removed.', type: 'success' })
        } else {
            showToast({ title: 'Failed to delete', message: 'Something went wrong. Please try again.', type: 'error' })
        }
    }

    const handleMarkAllAsRead = async () => {
        const result = await markAllAsRead()
        if (result?.success) {
            showToast({ title: 'All caught up!', message: 'All notifications have been marked as read.', type: 'success' })
        }
    }

    const handleClearAllNotifications = async () => {
        if (!confirmClear) {
            setConfirmClear(true)
            setTimeout(() => setConfirmClear(false), 3000)
            return
        }
        setConfirmClear(false)
        const response = await deleteAllNotifications()
        if (response?.success) {
            showToast({ title: 'Notifications cleared', message: 'All notifications have been removed.', type: 'success' })
        } else {
            showToast({ title: 'Failed to clear', message: 'Something went wrong. Please try again.', type: 'error' })
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-100 flex items-center justify-center"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/60" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-xl h-[85vh] bg-white dark:bg-[#161B26] rounded-2xl shadow-2xl flex flex-col overflow-hidden mx-4"
                    >
                        {/* Header */}
                        <div className="px-6 pt-5 pb-0">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
                                <div className="flex items-center gap-1">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-[#94969C] hover:text-crimson-600 hover:bg-gray-100 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] transition-colors"
                                            title="Mark all as read"
                                        >
                                            <CheckCheck className="w-4 h-4" />
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={handleClearAllNotifications}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-[#94969C] hover:text-red-500 hover:bg-red-50 transition-colors"
                                            title="Clear all notifications"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-[#94969C] hover:text-gray-600 dark:hover:text-gray-300  hover:bg-gray-100 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Clear all confirmation banner */}
                            <AnimatePresence>
                                {confirmClear && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex items-center justify-between gap-3 px-4 py-3 mb-3 bg-red-50 rounded-xl border border-red-100">
                                            <p className="text-xs text-red-700 font-medium">Clear all notifications? This cannot be undone.</p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => setConfirmClear(false)}
                                                    className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-[#94969C] bg-white dark:bg-[#161B26] rounded-lg border border-gray-200 dark:border-[#1F2A37] hover:bg-gray-50 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleClearAllNotifications}
                                                    className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    Confirm
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Filter tabs */}
                            <div className="flex items-center gap-1 pb-3 overflow-x-auto scrollbar-hide">
                                {TABS.map((tab) => {
                                    const count = categoryCounts[tab.key]
                                    const isActive = activeTab === tab.key
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActive
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-500 dark:text-[#94969C] hover:bg-gray-100 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] hover:text-gray-700 dark:hover:text-gray-200'
                                                }`}
                                        >
                                            {tab.label}
                                            {count > 0 && (
                                                <span className={`text-xs ${isActive ? 'text-gray-300 dark:text-[#94969C]' : 'text-gray-400 dark:text-[#94969C]'}`}>
                                                    {count}
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Search bar */}
                            <div className="relative pb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#94969C] pointer-events-none" style={{ top: 'calc(50% - 6px)' }} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search notifications..."
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-[#1F2A37] text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#94969C] outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741] transition-all"
                                />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gray-100 dark:bg-[#1F242F]" />

                        {/* Notification list */}
                        <div className="flex-1 overflow-y-auto scrollbar-notifications">
                            {isLoading ? (
                                <div className="animate-pulse">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="px-6 py-5 border-b border-gray-50 dark:border-[#1F2A37]">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#1F242F] shrink-0" />
                                                <div className="flex-1">
                                                    <div className="h-4 w-48 bg-gray-200 dark:bg-[#1F242F] rounded mb-2" />
                                                    <div className="h-3 w-32 bg-gray-100 dark:bg-[#1F242F] rounded mb-3" />
                                                    <div className="h-12 w-full bg-gray-50 dark:bg-[#1F242F] rounded-lg" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-16">
                                    <div className="w-14 h-14 rounded-full bg-gray-50 dark:bg-[#1F242F] flex items-center justify-center">
                                        <BellOff className="w-6 h-6 text-gray-300 dark:text-[#94969C]" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-[#94969C]">No notifications</p>
                                    <p className="text-xs text-gray-400 dark:text-[#94969C]">
                                        {searchQuery.trim()
                                            ? 'No notifications match your search'
                                            : activeTab === 'all'
                                                ? 'Disease alerts and system updates will appear here'
                                                : activeTab === 'unread'
                                                    ? 'All notifications have been read'
                                                    : `No ${activeTab} notifications yet`
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="pb-4">
                                    {filteredNotifications.map((notif, idx) => {
                                        const style = getNotifStyle(notif.title)
                                        const title = cleanTitle(notif.title)
                                        const IconComp = style.Icon
                                        const category = getNotifCategory(notif.title)
                                        const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1)

                                        return (
                                            <motion.div
                                                key={notif.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.03, duration: 0.2 }}
                                                onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                                                className={`group relative px-6 py-4 border-b border-gray-50 dark:border-[#1F2A37] cursor-pointer transition-colors ${!notif.is_read ? 'hover:bg-gray-50/80 dark:bg-[#1F242F]' : 'hover:bg-gray-50/50 dark:bg-[#0C111D]'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Icon avatar */}
                                                    <div className="shrink-0">
                                                        <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center`}>
                                                            <IconComp className={`w-4.5 h-4.5 ${style.color}`} />
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className={`text-sm leading-snug pr-6 ${!notif.is_read ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-[#94969C]'}`}>
                                                                {title}
                                                                <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[0.6rem] font-semibold uppercase ${style.bg} ${style.color}`}>
                                                                    {categoryLabel}
                                                                </span>
                                                            </p>
                                                            {/* Unread dot — hidden on hover when delete shows */}
                                                            {!notif.is_read && (
                                                                <span className="shrink-0 mt-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full group-hover:opacity-0 transition-opacity" />
                                                            )}
                                                        </div>

                                                        {/* Date row */}
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span className="text-xs text-gray-400 dark:text-[#94969C]">{formatDateTime(notif.created_at)}</span>
                                                            <span className="text-xs text-gray-400 dark:text-[#94969C]">{formatRelativeTime(notif.created_at)}</span>
                                                        </div>

                                                        {/* Message in quote box */}
                                                        {notif.message && (
                                                            <div className="mt-2.5 px-3 py-2.5 bg-gray-50 dark:bg-[#1F242F] rounded-xl border border-gray-100 dark:border-[#1F2A37]">
                                                                <p className={`text-[0.8rem] leading-relaxed ${!notif.is_read ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 '}`}>
                                                                    {notif.message}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Delete button on hover */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteNotification(notif.id)
                                                    }}
                                                    className="absolute top-4 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 dark:text-[#94969C] hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Delete notification"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )
            }
        </AnimatePresence >
    )
}

export default NotificationModal
