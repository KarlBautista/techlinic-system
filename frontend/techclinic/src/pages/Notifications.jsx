import React, { useEffect } from 'react'
import Navigation from '../components/newNavigation'
import Swal from 'sweetalert2'
import useAuth from '../store/useAuthStore'
import useNotificationStore, { requestNotificationPermission } from '../store/useNotificationStore'

// Determine icon + accent color based on notification title
const getNotifStyle = (title = '') => {
    const t = title.toLowerCase();
    if (t.includes('disease') || t.includes('alert'))
        return { icon: 'fa-solid fa-triangle-exclamation', color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200', dot: 'bg-amber-500' };
    if (t.includes('stock') || t.includes('medicine') || t.includes('inventory'))
        return { icon: 'fa-solid fa-pills', color: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-200', dot: 'bg-rose-500' };
    if (t.includes('system') || t.includes('update'))
        return { icon: 'fa-solid fa-circle-info', color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200', dot: 'bg-blue-500' };
    return { icon: 'fa-solid fa-bell', color: 'text-gray-600', bg: 'bg-gray-50', ring: 'ring-gray-200', dot: 'bg-gray-500' };
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
        <div className='h-screen w-full flex flex-col sm:flex-row'>
            <div className='h-[8%] w-full order-last sm:order-0 sm:w-[20%] sm:h-full md:w-[16%] lg:w-[14%]'>
                <Navigation />
            </div>
            
            <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[80%] md:w-[84%] lg:w-[86%] overflow-auto p-6 flex flex-col gap-4'>
                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#b01c34] flex items-center justify-center">
                            <i className="fa-solid fa-bell text-white text-sm"></i>
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
                                className="px-3 py-1.5 text-sm font-medium text-[#b01c34] bg-[#b01c34]/10 hover:bg-[#b01c34]/20 rounded-lg transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAllNotifications}
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Notification list */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
                            <div className="w-8 h-8 border-3 border-[#b01c34]/30 border-t-[#b01c34] rounded-full animate-spin"></div>
                            <p className="text-sm text-gray-400">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
                                <i className="fa-solid fa-bell-slash text-2xl text-gray-300"></i>
                            </div>
                            <p className="text-sm font-medium text-gray-500">No notifications</p>
                            <p className="text-xs text-gray-400">Disease alerts and system updates will appear here</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50 overflow-y-auto flex-1">
                            {notifications.map((notif) => {
                                const style = getNotifStyle(notif.title);
                                const title = cleanTitle(notif.title);

                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                                        className={`group flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer ${
                                            !notif.is_read
                                                ? 'bg-slate-50/80 hover:bg-slate-100/80'
                                                : 'hover:bg-gray-50/60'
                                        }`}
                                    >
                                        {/* Icon */}
                                        <div className={`mt-0.5 shrink-0 w-9 h-9 rounded-lg ${style.bg} ring-1 ${style.ring} flex items-center justify-center`}>
                                            <i className={`${style.icon} text-sm ${style.color}`}></i>
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
                                            className="shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete notification"
                                        >
                                            <i className="fa-solid fa-trash-can text-xs"></i>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Notifications