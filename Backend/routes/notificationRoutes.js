const express = require('express');
const router = express.Router();
const {
    checkAndCreateAlerts,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} = require('../controllers/notificationController');


router.post('/check-alerts', checkAndCreateAlerts);


router.get('/user/:userId', getUserNotifications);


router.patch('/:notificationId/read', markAsRead);


router.patch('/user/:userId/read-all', markAllAsRead);


router.delete('/:notificationId', deleteNotification);


router.delete('/user/:userId/all', deleteAllNotifications);

module.exports = router;