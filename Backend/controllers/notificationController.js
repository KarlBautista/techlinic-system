const supabase = require("../config/supabaseAdmin");

// Get all disease statistics and create notifications for alerts
const checkAndCreateAlerts = async (req, res) => {
    try {
        const MIN_POPULATION = 10;
        const MIN_CASES = 5;
        const ALERT_THRESHOLD = 10;

        // 1️⃣ Fetch all diagnosis records
        const { data: allRecordsData, error: allRecordsError } = await supabase
            .from("diagnoses")
            .select("disease_id");

        if (allRecordsError) {
            console.error(`Error getting records: ${allRecordsError.message}`);
            return res.status(500).json({ success: false, error: allRecordsError.message });
        }

        // 2️⃣ Fetch total patient population
        const { count: totalPopulation, error: populationError } = await supabase
            .from("patients")
            .select("*", { count: "exact", head: true });

        if (populationError) {
            console.error(`Error getting population: ${populationError.message}`);
            return res.status(500).json({ success: false, error: populationError.message });
        }

        // 3️⃣ Count cases per disease
        const diseaseCounts = allRecordsData.reduce((acc, record) => {
            acc[record.disease_id] = (acc[record.disease_id] || 0) + 1;
            return acc;
        }, {});

        // 4️⃣ Fetch disease names
        const { data: diseases, error: diseaseError } = await supabase
            .from("diseases")
            .select("id, name");

        if (diseaseError) {
            console.error(`Error getting diseases: ${diseaseError.message}`);
            return res.status(500).json({ success: false, error: diseaseError.message });
        }

        // 5️⃣ Build disease statistics with alert logic
        const stats = diseases.map((disease) => {
            const totalCases = diseaseCounts[disease.id] || 0;

            if (totalPopulation < MIN_POPULATION) {
                return {
                    disease_id: disease.id,
                    disease_name: disease.name,
                    total_cases: totalCases,
                    percentage: null,
                    alert: false,
                    status: "INSUFFICIENT_DATA"
                };
            }

            const percentage = (totalCases / totalPopulation) * 100;
            const alert = totalCases >= MIN_CASES && percentage >= ALERT_THRESHOLD;

            return {
                disease_id: disease.id,
                disease_name: disease.name,
                total_cases: totalCases,
                percentage: Number(percentage.toFixed(2)),
                alert,
                status: alert ? "ALERT" : "OK"
            };
        });

        // 6️⃣ Filter diseases that need alerts
        const alertDiseases = stats.filter(d => d.alert);

        if (alertDiseases.length === 0) {
            return res.json({ success: true, message: 'No alerts to create', alerts: [] });
        }

        // 7️⃣ Fetch all users
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id');

        if (usersError) {
            console.error('Error fetching users:', usersError);
            return res.status(500).json({ success: false, error: usersError.message });
        }

        const newNotifications = [];

        // 8️⃣ Create notifications for each alert disease
        for (const disease of alertDiseases) {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

            // Check if notification was already created in the last hour
            const { data: existingNotif } = await supabase
                .from('notifications')
                .select('id')
                .eq('title', `⚠️ Disease Alert: ${disease.disease_name}`)
                .gte('created_at', oneHourAgo)
                .limit(1);

            if (existingNotif && existingNotif.length > 0) continue; // Skip duplicates

            // Create notification for each user
            for (const user of users) {
                newNotifications.push({
                    user_id: user.id,
                    title: `⚠️ Disease Alert: ${disease.disease_name}`,
                    message: `${disease.total_cases} cases detected (${disease.percentage}% of population). Immediate attention required.`,
                    is_read: false,
                    metadata: {
                        disease_id: disease.disease_id,
                        total_cases: disease.total_cases,
                        percentage: disease.percentage,
                        status: 'ALERT',
                        created_timestamp: new Date().toISOString()
                    }
                });
            }
        }

        // 9️⃣ Bulk insert notifications
        if (newNotifications.length > 0) {
            const { data: insertedNotifs, error: insertError } = await supabase
                .from('notifications')
                .insert(newNotifications)
                .select();

            if (insertError) {
                console.error('Error inserting notifications:', insertError);
                return res.status(500).json({ success: false, error: insertError.message });
            }

            return res.json({
                success: true,
                message: `Created ${insertedNotifs.length} notifications`,
                notifications: insertedNotifs
            });
        }

        return res.json({ success: true, message: 'No new notifications to create', notifications: [] });

    } catch (err) {
        console.error('Error in checkAndCreateAlerts:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// Get notifications for a specific user
const getUserNotifications = async (req, res) => {
    const { userId } = req.params;

    try {
        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        return res.json({ 
            success: true, 
            notifications,
            unreadCount: notifications.filter(n => !n.is_read).length
        });

    } catch (err) {
        console.error('Error in getUserNotifications:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    const { notificationId } = req.params;

    try {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .select();

        if (error) {
            console.error('Error marking notification as read:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        return res.json({ success: true, notification: data[0] });

    } catch (err) {
        console.error('Error in markAsRead:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// Mark all notifications as read for a user
const markAllAsRead = async (req, res) => {
    const { userId } = req.params;

    try {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false)
            .select();

        if (error) {
            console.error('Error marking all as read:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        return res.json({ 
            success: true, 
            message: `Marked ${data.length} notifications as read`,
            notifications: data 
        });

    } catch (err) {
        console.error('Error in markAllAsRead:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// Delete a notification
const deleteNotification = async (req, res) => {
    const { notificationId } = req.params;

    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId);

        if (error) {
            console.error('Error deleting notification:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        return res.json({ success: true, message: 'Notification deleted' });

    } catch (err) {
        console.error('Error in deleteNotification:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// Delete all notifications for a user
const deleteAllNotifications = async (req, res) => {
    const { userId } = req.params;

    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.error('Error deleting all notifications:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        return res.json({ success: true, message: 'All notifications deleted' });

    } catch (err) {
        console.error('Error in deleteAllNotifications:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    checkAndCreateAlerts,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
};  