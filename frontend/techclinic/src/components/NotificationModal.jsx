import React, { useEffect, useState } from 'react'
import { showToast } from './Toast'
import useAuth from '../store/useAuthStore'
import useNotificationStore, { requestNotificationPermission } from '../store/useNotificationStore'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, AlertTriangle, Pill, Info, Trash2, X } from 'lucide-react'

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

const cleanTitle = (title) => title?.replace(/[\u{1F600}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}]/gu, '').trim() || title;

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

const NotificationModal = ({ isOpen, onClose }) => {
    const { authenticatedUser } = useAuth();
    const {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications
    } = useNotificationStore();

    const [confirmClear, setConfirmClear] = useState(false);

    useEffect(() => {
        if (isOpen && authenticatedUser?.id) {
            requestNotificationPermission();
            fetchNotifications(authenticatedUser.id, true);
        }
    }, [isOpen, authenticatedUser?.id]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    const handleMarkAsRead = async (notificationId) => {
        await markAsRead(notificationId);
    };

    const handleDeleteNotification = async (notificationId) => {
        const result = await deleteNotification(notificationId);
        if (result?.success) {
            showToast({ title: 'Notification deleted', message: 'The notification has been removed.', type: 'success' });
        } else {
            showToast({ title: 'Failed to delete', message: 'Something went wrong. Please try again.', type: 'error' });
        }
    };

    const handleMarkAllAsRead = async () => {
        const result = await markAllAsRead(authenticatedUser.id);
        if (result?.success) {
            showToast({ title: 'All caught up!', message: 'All notifications have been marked as read.', type: 'success' });
        }
    };

    const handleClearAllNotifications = async () => {
        if (!confirmClear) {
            setConfirmClear(true);
            setTimeout(() => setConfirmClear(false), 3000);
            return;
        }
        setConfirmClear(false);
        const response = await deleteAllNotifications(authenticatedUser.id);
        if (response?.success) {
            showToast({ title: 'Notifications cleared', message: 'All notifications have been removed.', type: 'success' });
        } else {
            showToast({ title: 'Failed to clear', message: 'Something went wrong. Please try again.', type: 'error' });
        }
    };

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
                    {/* Backdrop with blur */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

                    {/* Modal content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-lg max-h-[80vh] bg-white rounded-2xl shadow-2xl ring-1 ring-gray-200 flex flex-col overflow-hidden mx-4"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-crimson-600 flex items-center justify-center shadow-sm">
                                    <Bell className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-800">Notifications</h2>
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
                                        className="px-3 py-1.5 text-xs font-medium text-crimson-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={handleClearAllNotifications}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                            confirmClear
                                                ? 'text-red-700 bg-red-50 hover:bg-red-100'
                                                : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    >
                                        {confirmClear ? 'Confirm?' : 'Clear all'}
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Notification list */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="animate-pulse divide-y divide-gray-50">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="px-5 py-4 flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-gray-200 shrink-0" />
                                            <div className="flex-1">
                                                <div className="h-3.5 w-36 bg-gray-200 rounded" />
                                                <div className="h-3 w-56 bg-gray-100 rounded mt-2" />
                                                <div className="h-3 w-16 bg-gray-100 rounded mt-2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-16">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                                        <BellOff className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">No notifications</p>
                                    <p className="text-xs text-gray-400">Disease alerts and system updates will appear here</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((notif, idx) => {
                                        const style = getNotifStyle(notif.title);
                                        const title = cleanTitle(notif.title);
                                        const IconComp = style.Icon;

                                        return (
                                            <motion.div
                                                key={notif.id}
                                                initial={{ opacity: 0, x: -6 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.02, duration: 0.2 }}
                                                onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                                                className={`group flex items-start gap-3 px-5 py-3.5 transition-colors cursor-pointer ${
                                                    !notif.is_read
                                                        ? 'bg-slate-50/80 hover:bg-slate-100/80'
                                                        : 'hover:bg-gray-50/60'
                                                }`}
                                            >
                                                <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-lg ${style.bg} ring-1 ${style.ring} flex items-center justify-center`}>
                                                    <IconComp className={`w-3.5 h-3.5 ${style.color}`} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        {!notif.is_read && (
                                                            <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                                        )}
                                                        <span className={`text-sm font-semibold truncate ${!notif.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                            {title}
                                                        </span>
                                                        <span className="shrink-0 text-[0.65rem] text-gray-400 ml-auto">
                                                            {formatDate(notif.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className={`text-xs leading-relaxed ${!notif.is_read ? 'text-gray-700' : 'text-gray-500'}`}>
                                                        {notif.message}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteNotification(notif.id);
                                                    }}
                                                    className="shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Delete notification"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationModal;
