const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { validateIdParam } = require("../middleware/validate");
const {
    checkAndCreateAlerts,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} = require('../controllers/notificationController');

// ── All notification endpoints require authentication, all roles ──
router.post('/check-alerts', authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), checkAndCreateAlerts);
router.get('/user/:userId', authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), validateIdParam('userId'), getUserNotifications);
router.patch('/:notificationId/read', authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), validateIdParam('notificationId'), markAsRead);
router.patch('/user/:userId/read-all', authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), validateIdParam('userId'), markAllAsRead);
router.delete('/:notificationId', authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), validateIdParam('notificationId'), deleteNotification);
router.delete('/user/:userId/all', authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), validateIdParam('userId'), deleteAllNotifications);

module.exports = router;