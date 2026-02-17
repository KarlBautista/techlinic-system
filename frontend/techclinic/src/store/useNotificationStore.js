import { create } from 'zustand';
import api from '../lib/api';

// API_BASE is empty because api.js already has baseURL = "http://localhost:3000/api"
const API_BASE = '';

// Request browser notification permission
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        return true;
    }
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    
    return false;
};

// Show browser push notification
export const showBrowserNotification = (title, message, options = {}) => {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: options.tag || 'techclinic-alert',
            requireInteraction: options.requireInteraction ?? true,
            vibrate: [200, 100, 200],
            ...options
        });
        
        notification.onclick = () => {
            window.focus();
            if (options.onClick) options.onClick();
            notification.close();
        };
        
        // Auto close after 10 seconds
        setTimeout(() => notification.close(), options.timeout || 10000);
        
        return notification;
    }
    return null;
};

const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    lastChecked: null,
    _isFetching: false,

    // Fetch notifications for a user
    fetchNotifications: async (userId) => {
        if (!userId) return;
        if (get()._isFetching) return; // Prevent concurrent fetches
        
        set({ _isFetching: true, isLoading: !get().notifications.length, error: null });
        
        try {
            const response = await api.get(`${API_BASE}/user/${userId}`);
            
            if (response.data.success) {
                const prevUnreadCount = get().unreadCount;
                const newUnreadCount = response.data.unreadCount;
                
                // Show browser notification if there are new unread notifications
                if (newUnreadCount > prevUnreadCount && prevUnreadCount >= 0) {
                    const latestUnread = response.data.notifications.find(n => !n.is_read);
                    if (latestUnread) {
                        showBrowserNotification(latestUnread.title, latestUnread.message);
                    }
                }
                
                set({
                    notifications: response.data.notifications,
                    unreadCount: newUnreadCount,
                    isLoading: false,
                    _isFetching: false,
                    lastChecked: new Date().toISOString()
                });
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
            set({ error: err.message, isLoading: false, _isFetching: false });
        }
    },

    // Check for new alerts
    checkForAlerts: async (userId) => {
        try {
            const response = await api.post(`${API_BASE}/check-alerts`);
            
            // If new notifications were created, show browser notification
            if (response.data.success && response.data.notifications?.length > 0) {
                const firstNotif = response.data.notifications[0];
                showBrowserNotification(
                    '⚠️ New Disease Alert',
                    firstNotif.message || 'New health alert detected. Click to view details.'
                );
            }
            
            // Refresh notifications list
            if (userId) {
                await get().fetchNotifications(userId);
            }
            
            return response.data;
        } catch (err) {
            console.error('Error checking for alerts:', err);
            return null;
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        try {
            const response = await api.patch(`${API_BASE}/${notificationId}/read`);
            
            if (response.data.success) {
                set(state => ({
                    notifications: state.notifications.map(n =>
                        n.id === notificationId ? { ...n, is_read: true } : n
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1)
                }));
            }
            return response.data;
        } catch (err) {
            console.error('Error marking as read:', err);
            return null;
        }
    },

    // Mark all as read for a user
    markAllAsRead: async (userId) => {
        try {
            const response = await api.patch(`${API_BASE}/user/${userId}/read-all`);
            
            if (response.data.success) {
                set(state => ({
                    notifications: state.notifications.map(n => ({ ...n, is_read: true })),
                    unreadCount: 0
                }));
            }
            return response.data;
        } catch (err) {
            console.error('Error marking all as read:', err);
            return null;
        }
    },

    // Delete a notification
    deleteNotification: async (notificationId) => {
        try {
            const response = await api.delete(`${API_BASE}/${notificationId}`);
            
            if (response.data.success) {
                set(state => ({
                    notifications: state.notifications.filter(n => n.id !== notificationId),
                    unreadCount: state.notifications.find(n => n.id === notificationId && !n.is_read)
                        ? Math.max(0, state.unreadCount - 1)
                        : state.unreadCount
                }));
            }
            return response.data;
        } catch (err) {
            console.error('Error deleting notification:', err);
            return null;
        }
    },

    // Delete all notifications for a user
    deleteAllNotifications: async (userId) => {
        try {
            const response = await api.delete(`${API_BASE}/user/${userId}/all`);
            
            if (response.data.success) {
                set({ notifications: [], unreadCount: 0 });
            }
            return response.data;
        } catch (err) {
            console.error('Error deleting all notifications:', err);
            return null;
        }
    },

    // Clear store
    clearNotifications: () => {
        set({ notifications: [], unreadCount: 0, error: null });
    }
}));

export default useNotificationStore;
