import React, { useEffect } from 'react'
import Swal from 'sweetalert2'
import useAuth from '../store/useAuthStore'
import useNotificationStore, { requestNotificationPermission } from '../store/useNotificationStore'
import { motion } from 'framer-motion'
import { Bell, BellOff, AlertTriangle, Pill, Info, Trash2 } from 'lucide-react'

// Determine icon + accent color based on notification title
const getNotifStyle = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('disease') || t.includes('alert'))
        return { Icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200', dot: 'bg-amber-500' };
    if (t.includes('stock') || t.includes('medicine') || t.includes('inventory'))
        return { Icon: Pill, color: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-200', dot: 'bg-rose-500' };
    if (t.includes('system') || t.includes('update'))
        return { Icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200', dot: 'bg-blue-500' };
    return { Icon: Bell, color: 'text-gray-600', bg: 'bg-gray-50', ring: 'ring-gray-200', dot: 'bg-gray-500' };
};

const Notifications = () => {
    const { authenticatedUser } = useAuth();
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        checkForAlerts,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications
    } = useNotificationStore();

    // Request notification permission on mount
    useEffect(() => {
        requestNotificationPermission();
    }, []);

    useEffect(() => {
        if (!authenticatedUser?.id) return;

        // Refresh once on mount — Navigation handles ongoing polling
        fetchNotifications(authenticatedUser.id);
    }, [authenticatedUser?.id]);

    const handleMarkAsRead = async (notificationId) => {
        await markAsRead(notificationId);
    };

    const handleDeleteNotification = async (notificationId) => {
        const result = await deleteNotification(notificationId);
        if (result?.success) {
            Swal.fire({
                title: 'Deleted',
                text: 'Notification has been removed.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Failed to delete notification',
                icon: 'error'
            });
        }
    };

    const handleMarkAllAsRead = async () => {
        const result = await markAllAsRead(authenticatedUser.id);
        if (result?.success) {
            Swal.fire({
                title: 'Done',
                text: 'All notifications marked as read.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    };

    const handleClearAllNotifications = () => {
        Swal.fire({
            title: 'Clear all notifications?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#b01c34',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, clear all'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const response = await deleteAllNotifications(authenticatedUser.id);
                if (response?.success) {
                    Swal.fire({
                        title: 'Cleared',
                        text: 'All notifications have been removed.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: 'Failed to clear notifications',
                        icon: 'error'
                    });
                }
            }
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    // Strip emojis from title for clean display
    const cleanTitle = (title) => title?.replace(/[\u{1F600}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}]/gu, '').trim() || title;

    return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className='flex flex-col gap-4'
            >
                {/* Page header */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-crimson-600 flex items-center justify-center shadow-sm">
                            <Bell className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
                            <p className="text-xs text-gray-500">
                                {unreadCount > 0
                                    ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                    : 'All caught up'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="px-3 py-1.5 text-sm font-medium text-crimson-700 bg-crimson-50 hover:bg-crimson-100 rounded-xl transition-colors ring-1 ring-crimson-100"
                            >
                                Mark all read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAllNotifications}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors ring-1 ring-gray-100"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Notification list */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.35 }}
                    className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 flex-1 overflow-hidden flex flex-col"
                >
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
                            <div className="w-8 h-8 border-3 border-crimson-200 border-t-crimson-600 rounded-full animate-spin"></div>
                            <p className="text-sm text-gray-400">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center">
                                <BellOff className="w-7 h-7 text-gray-300" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">No notifications</p>
                            <p className="text-xs text-gray-400">Disease alerts and system updates will appear here</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 overflow-y-auto flex-1">
                            {notifications.map((notif, idx) => {
                                const style = getNotifStyle(notif.title);
                                const title = cleanTitle(notif.title);
                                const IconComp = style.Icon;

                                return (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03, duration: 0.25 }}
                                        onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                                        className={`group flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer ${
                                            !notif.is_read
                                                ? 'bg-slate-50/80 hover:bg-slate-100/80'
                                                : 'hover:bg-gray-50/60'
                                        }`}
                                    >
                                        {/* Icon */}
                                        <div className={`mt-0.5 shrink-0 w-9 h-9 rounded-xl ${style.bg} ring-1 ${style.ring} flex items-center justify-center`}>
                                            <IconComp className={`w-4 h-4 ${style.color}`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                {!notif.is_read && (
                                                    <span className={`shrink-0 w-2 h-2 rounded-full ${style.dot}`}></span>
                                                )}
                                                <span className={`text-sm font-semibold truncate ${!notif.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {title}
                                                </span>
                                                <span className="shrink-0 text-xs text-gray-400 ml-auto">
                                                    {formatDate(notif.created_at)}
                                                </span>
                                            </div>
                                            <p className={`text-sm leading-relaxed ${!notif.is_read ? 'text-gray-700' : 'text-gray-500'}`}>
                                                {notif.message}
                                            </p>
                                        </div>

                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteNotification(notif.id);
                                            }}
                                            className="shrink-0 mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete notification"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </motion.div>
    )
}

export default Notifications