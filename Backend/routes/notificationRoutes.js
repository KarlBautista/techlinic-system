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

// ── All notification endpoints require autnpmentication, both roles ──
router.post('/check-alerts', authenticate, authorize("DOCTOR", "NURSE"), checkAndCreateAlerts);
router.get('/user/:userId', authenticate, authorize("DOCTOR", "NURSE"), validateIdParam('userId'), getUserNotifications);
router.patch('/:notificationId/read', authenticate, authorize("DOCTOR", "NURSE"), validateIdParam('notificationId'), markAsRead);
router.patch('/user/:userId/read-all', authenticate, authorize("DOCTOR", "NURSE"), validateIdParam('userId'), markAllAsRead);
router.delete('/:notificationId', authenticate, authorize("DOCTOR", "NURSE"), validateIdParam('notificationId'), deleteNotification);
router.delete('/user/:userId/all', authenticate, authorize("DOCTOR", "NURSE"), validateIdParam('userId'), deleteAllNotifications);

module.exports = router;