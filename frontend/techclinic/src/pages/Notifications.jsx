import React, { useEffect, useState } from 'react'
import Navigation from '../components/newNavigation'
import axios from 'axios'
import Swal from 'sweetalert2'
import useAuth from '../store/useAuthStore' 

const Notifications = () => {
    const { authenticatedUser } = useAuth(); 
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

const fetchNotifications = async () => {
    if (!authenticatedUser?.id) return;

    try {
        const response = await axios.get(
            `http://localhost:3000/api/user/${authenticatedUser.id}`
        );
        
        if (response.data.success) {
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
        }
        
        setIsLoading(false);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        setIsLoading(false);
    }
};

    // Check for new alerts (this runs every 10 seconds)
  const checkForAlerts = async () => {
    try {
       await axios.post('http://localhost:3000/api/check-alerts');
        fetchNotifications();
    } catch (err) {
        console.error('Error checking for alerts:', err);
    }
};

    useEffect(() => {
        if (!authenticatedUser?.id) return;

        // Initial fetch
        fetchNotifications();
        
        // Check for alerts immediately
        checkForAlerts();
        
        // Set up polling every 10 seconds
        const intervalId = setInterval(() => {
            checkForAlerts();
        }, 10000); // 10 seconds
        
        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [authenticatedUser?.id]);

    const markNotificationAsRead = async (notificationId) => {
        try {
            const response = await axios.patch(
                `http://localhost:3000/api/${notificationId}/read`
            );
            
            if (response.data.success) {
                // Update local state
                setNotifications(prev => 
                    prev.map(notif => 
                        notif.id === notificationId 
                            ? { ...notif, is_read: true }
                            : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const response = await axios.delete(
                `http://localhost:3000/api/notifications/${notificationId}`
            );
            
            if (response.data.success) {
                setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Notification has been deleted.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
            Swal.fire({
                title: 'Error',
                text: 'Failed to delete notification',
                icon: 'error'
            });
        }
    };

    const markAllAsRead = async () => {
    try {
        const response = await axios.patch(
            `http://localhost:3000/api/user/${authenticatedUser.id}/read-all`
        );
        
        if (response.data.success) {
            setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
            setUnreadCount(0);
            Swal.fire({
                title: 'Success!',
                text: 'All notifications marked as read.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    } catch (err) {
        console.error('Error marking all as read:', err);
    }
};

    const clearAllNotifications = () => {
        Swal.fire({
            title: 'Clear all notifications?',
            text: "This action cannot be undone",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, clear all'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axios.delete(
                        `http://localhost:3000/api/user/${authenticatedUser.id}/all`
                    );
                    
                    if (response.data.success) {
                        setNotifications([]);
                        setUnreadCount(0);
                        Swal.fire({
                            title: 'Cleared!',
                            text: 'All notifications have been cleared.',
                            icon: 'success',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    }
                } catch (err) {
                    console.error('Error clearing notifications:', err);
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
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    return (
        <div className='h-screen w-full flex flex-col sm:flex-row'>
            <div className='h-[8%] w-full order-last sm:order-0 sm:w-[23%] sm:h-full md:w-[19%] lg:w-[17%]'>
                <Navigation />
            </div>
            
            <div className='h-[92%] min-w-[360px] sm:min-w-0 w-full sm:h-full sm:w-[77%] md:w-[81%] lg:w-[83%] overflow-auto p-2 flex flex-col gap-2'>
                <div className='w-full h-full flex flex-col items-center gap-5 scrollbar'>
                    <div className='w-full flex flex-col gap-2'>
                        <div className='flex justify-between items-center'>
                            <div>
                                <p className='text-[1.5rem] font-semibold text-gray-900'>
                                    Notifications
                                    {unreadCount > 0 && (
                                        <span className='ml-2 text-sm bg-red-500 text-white px-2 py-1 rounded-full'>
                                            {unreadCount}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className='flex gap-2'>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className='sm:px-4 sm:py-2 px-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[.7rem] sm:text-sm font-medium transition-colors'
                                    >
                                        Mark All Read
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button
                                        onClick={clearAllNotifications}
                                        className='px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors'
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                  
                    <div className='w-[90%] h-full overflow-y-auto'>
                        {isLoading ? (
                            <div className='w-full h-full flex items-center justify-center'>
                                <p className='text-gray-500'>Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className='w-full h-full flex flex-col items-center justify-center gap-2'>
                                <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <p className='text-gray-500 font-medium'>No notifications</p>
                                <p className='text-gray-400 text-sm'>Disease alerts will appear here</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div 
                                    key={notif.id} 
                                    className={`border ${!notif.is_read ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'} p-3 rounded-[10px] min-h-[80px] mt-2 w-full flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                                    onClick={() => !notif.is_read && markNotificationAsRead(notif.id)}
                                >
                                    <div className='h-[40%] w-full flex justify-between items-center'>
                                        <p className='text-[1rem] font-bold text-gray-900 flex items-center gap-2'>
                                            {notif.title}
                                            {!notif.is_read && (
                                                <span className='text-xs bg-red-500 text-white px-2 py-0.5 rounded-full'>
                                                    NEW
                                                </span>
                                            )}
                                        </p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notif.id);
                                            }}
                                            className='text-gray-400 hover:text-red-500 transition-colors'
                                            title='Delete notification'
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className='h-[60%] w-full flex flex-col justify-center text-[.9rem] p-1 gap-1'>
                                        <p className='text-gray-700'>{notif.message}</p>
                                        <div className='flex justify-between items-center text-xs text-gray-500 mt-1'>
                                            <span className={`font-semibold ${!notif.is_read ? 'text-red-600' : 'text-gray-600'}`}>
                                                {notif.metadata?.status || 'ALERT'}
                                            </span>
                                            <span>{formatDate(notif.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Notifications