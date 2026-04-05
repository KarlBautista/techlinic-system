const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { validateIdParam } = require("../middleware/validate");
const {
    checkAndCreateAlerts,
    getAllNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} = require('../controllers/notificationController');

// ── All notification endpoints require authentication, all roles ──
router.post('/check-alerts', authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), checkAndCreateAlerts);
router.get('/all', authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), getAllNotifications);
router.patch('/read-all', authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), markAllAsRead);
router.patch('/:notificationId/read', authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), validateIdParam('notificationId'), markAsRead);
router.delete('/all', authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), deleteAllNotifications);
router.delete('/:notificationId', authenticate, authorize("DOCTOR", "NURSE", "ADMIN"), validateIdParam('notificationId'), deleteNotification);

module.exports = router;