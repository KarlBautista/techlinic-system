const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const {
    checkAndCreateAlerts,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} = require('../controllers/notificationController');

// ── All notification endpoints require authentication, both roles ──
router.post('/check-alerts', authenticate, authorize("DOCTOR", "NURSE"), checkAndCreateAlerts);
router.get('/user/:userId', authenticate, authorize("DOCTOR", "NURSE"), getUserNotifications);
router.patch('/:notificationId/read', authenticate, authorize("DOCTOR", "NURSE"), markAsRead);
router.patch('/user/:userId/read-all', authenticate, authorize("DOCTOR", "NURSE"), markAllAsRead);
router.delete('/:notificationId', authenticate, authorize("DOCTOR", "NURSE"), deleteNotification);
router.delete('/user/:userId/all', authenticate, authorize("DOCTOR", "NURSE"), deleteAllNotifications);

module.exports = router;