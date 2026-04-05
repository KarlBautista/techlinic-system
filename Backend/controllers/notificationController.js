const supabase = require("../config/supabaseAdmin");

// ── In-memory notification cache (centralized — same data for all users) ──
let _notifCache = null;
let _notifCacheTime = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds

const invalidateCache = () => {
    _notifCache = null;
    _notifCacheTime = 0;
};

const getCachedNotifications = async () => {
    if (_notifCache && (Date.now() - _notifCacheTime < CACHE_TTL)) {
        return _notifCache;
    }

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    _notifCache = data;
    _notifCacheTime = Date.now();
    return data;
};

// Get all disease statistics and create notifications for alerts
const checkAndCreateAlerts = async (req, res) => {
    try {
        const MIN_POPULATION = 10;
        const MIN_CASES = 5;
        const ALERT_THRESHOLD = 10;
        const LOW_STOCK_THRESHOLD = 10; // Alert when medicine has ≤ 10 units

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

        const allCreatedNotifications = [];

        // 7️⃣ Create ONE centralized notification per alert disease
        if (alertDiseases.length > 0) {
            const newNotifications = [];

            for (const disease of alertDiseases) {
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

                // Check if notification was already created in the last hour
                const { data: existingNotif } = await supabase
                    .from('notifications')
                    .select('id')
                    .eq('title', `Disease Alert: ${disease.disease_name}`)
                    .gte('created_at', oneHourAgo)
                    .limit(1);

                if (existingNotif && existingNotif.length > 0) continue; // Skip duplicates

                // Create ONE system-wide notification (no user_id)
                newNotifications.push({
                    title: `Disease Alert: ${disease.disease_name}`,
                    message: `${disease.total_cases} cases detected (${disease.percentage}% of population). Immediate attention required.`,
                    is_read: false
                });
            }

            // Bulk insert disease alert notifications
            if (newNotifications.length > 0) {
                const { data: insertedNotifs, error: insertError } = await supabase
                    .from('notifications')
                    .insert(newNotifications)
                    .select();

                if (insertError) {
                    console.error('Error inserting notifications:', insertError);
                } else {
                    allCreatedNotifications.push(...(insertedNotifs || []));
                }
            }
        }

        // ══════════════════════════════════════════════════════════════
        // 🔟 LOW STOCK MEDICINE ALERTS
        // ══════════════════════════════════════════════════════════════

        const { data: lowStockMeds, error: stockError } = await supabase
            .from('medicines')
            .select('id, medicine_name, stock_level')
            .lte('stock_level', LOW_STOCK_THRESHOLD);

        if (stockError) {
            console.error('Error checking medicine stock:', stockError.message);
        }

        if (lowStockMeds && lowStockMeds.length > 0) {
            const stockNotifications = [];

            for (const med of lowStockMeds) {
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

                // Check for duplicate (same title within last hour)
                const { data: existingStockNotif } = await supabase
                    .from('notifications')
                    .select('id')
                    .eq('title', `Low Stock Alert: ${med.medicine_name}`)
                    .gte('created_at', oneHourAgo)
                    .limit(1);

                if (existingStockNotif && existingStockNotif.length > 0) continue;

                const stockMsg = med.stock_level <= 0
                    ? `${med.medicine_name} is out of stock. Please reorder immediately.`
                    : `${med.medicine_name} is running low with only ${med.stock_level} unit(s) remaining. Please reorder soon.`;

                // Create ONE system-wide notification (no user_id)
                stockNotifications.push({
                    title: `Low Stock Alert: ${med.medicine_name}`,
                    message: stockMsg,
                    is_read: false
                });
            }

            if (stockNotifications.length > 0) {
                const { data: insertedStock, error: stockInsertErr } = await supabase
                    .from('notifications')
                    .insert(stockNotifications)
                    .select();

                if (stockInsertErr) {
                    console.error('Error inserting stock notifications:', stockInsertErr);
                } else {
                    allCreatedNotifications.push(...(insertedStock || []));
                }
            }
        }

        // Final response
        if (allCreatedNotifications.length > 0) {
            invalidateCache();
            return res.json({
                success: true,
                message: `Created ${allCreatedNotifications.length} notifications`,
                notifications: allCreatedNotifications
            });
        }

        return res.json({ success: true, message: 'No new notifications to create', notifications: [] });

    } catch (err) {
        console.error('Error in checkAndCreateAlerts:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// Get all notifications (centralized — cached)
const getAllNotifications = async (req, res) => {
    try {
        const notifications = await getCachedNotifications();

        return res.json({ 
            success: true, 
            notifications,
            unreadCount: notifications.filter(n => !n.is_read).length
        });

    } catch (err) {
        console.error('Error in getAllNotifications:', err);
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

        invalidateCache();
        return res.json({ success: true, notification: data[0] });

    } catch (err) {
        console.error('Error in markAsRead:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// Mark all notifications as read (system-wide)
const markAllAsRead = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('is_read', false)
            .select();

        if (error) {
            console.error('Error marking all as read:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        invalidateCache();
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

        invalidateCache();
        return res.json({ success: true, message: 'Notification deleted' });

    } catch (err) {
        console.error('Error in deleteNotification:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// Delete all notifications (system-wide)
const deleteAllNotifications = async (req, res) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all rows

        if (error) {
            console.error('Error deleting all notifications:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        invalidateCache();
        return res.json({ success: true, message: 'All notifications deleted' });

    } catch (err) {
        console.error('Error in deleteAllNotifications:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    checkAndCreateAlerts,
    getAllNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
};  