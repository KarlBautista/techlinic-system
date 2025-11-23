const supabase = require("../config/supabaseClient");
const moment = require("moment");

const getWeeklyPatients = async (req, res) => {
    const timezoneOffset = 8; // for GMT+8
    const startOfWeek = moment().utcOffset(timezoneOffset).startOf("isoWeek").utc().format("YYYY-MM-DD 00:00:00");
    const endOfWeek = moment().utcOffset(timezoneOffset).endOf("isoWeek").utc().format("YYYY-MM-DD 23:59:59");

    try {
        const { data: weeklyPatientsData, error: weeklyPatientsError } = await supabase.from("records").select("*")
        .gte("created_at", startOfWeek).lte("created_at", endOfWeek);

        if(weeklyPatientsError){
            console.error("Error getting weekly patients");
            return res.status(500).json({ success: false, error: weeklyPatientsError.message });
        }
        let result = {
            Mon:0,
            Tue:0,
            Wed:0,  
            Thu:0,
            Fri:0,
            Sat:0,
            Sun:0,
        }
        weeklyPatientsData.forEach((patient) => {
            const day = moment(patient.created_at).format("ddd");
            result[day]++
        });
        res.status(200).json({ success: true, data: result, start_of_week: startOfWeek, end_of_week: endOfWeek });
    } catch (err) {
        console.error(`Something went wrong getting weekly patients`);
        return res.status(500).json({ success: false, erorr: err.message });
    }
   
}   



module.exports = { getWeeklyPatients }