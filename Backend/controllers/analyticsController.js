const supabase = require("../config/supabaseClient");
const moment = require("moment");

const getWeeklyPatients = async (req, res) => {
    const timezoneOffset = 8; 
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

 const getMonthyPatients = async (req, res) => {
    const timezoneOffset = 8; 

    try {
      
        const monthStart = moment().utcOffset(timezoneOffset).startOf("month");
        const monthEnd = moment().utcOffset(timezoneOffset).endOf("month");

        const startOfMonthStr = monthStart.format("YYYY-MM-DD 00:00:00");
        const endOfMonthStr = monthEnd.format("YYYY-MM-DD 23:59:59");

        const { data: monthlyPatientsData, error } = await supabase
            .from("records")
            .select("*")
            .gte("created_at", startOfMonthStr)
            .lte("created_at", endOfMonthStr);

        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }

        const lastDay = monthEnd.date();

        const weekRanges = [
            {
                start: monthStart.clone().date(1).format("YYYY-MM-DD 00:00:00"),
                end: monthStart.clone().date(7).format("YYYY-MM-DD 23:59:59"),
            },
            {
                start: monthStart.clone().date(8).format("YYYY-MM-DD 00:00:00"),
                end: monthStart.clone().date(14).format("YYYY-MM-DD 23:59:59"),
            },
            {
                start: monthStart.clone().date(15).format("YYYY-MM-DD 00:00:00"),
                end: monthStart.clone().date(21).format("YYYY-MM-DD 23:59:59"),
            },
            {
                start: monthStart.clone().date(22).format("YYYY-MM-DD 00:00:00"),
                end: monthStart.clone().date(lastDay).format("YYYY-MM-DD 23:59:59"),
            },
        ];

      
        const result = {
            week1: { timeframe: weekRanges[0], data: {}, count: 0 },
            week2: { timeframe: weekRanges[1], data: {}, count: 0 },
            week3: { timeframe: weekRanges[2], data: {}, count: 0 },
            week4: { timeframe: weekRanges[3], data: {}, count: 0 },
        };

        monthlyPatientsData.forEach((patient) => {
            const localDate = moment(patient.created_at).utcOffset(timezoneOffset);

            const day = localDate.date();

            if (day >= 1 && day <= 7) result.week1.count++;
            else if (day >= 8 && day <= 14) result.week2.count++;
            else if (day >= 15 && day <= 21) result.week3.count++;
            else result.week4.count++;
        });

        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
 
  const getQuarterlyPatient = async (req, res) => {
    try {
        const timezoneOffset = 8;
        const currentQuarter = moment().quarter();
        const startOfQuarter = moment().utcOffset(timezoneOffset).startOf("quarter").utc().format("YYYY-MM-DD 00:00:00");
        const endOfQuarter = moment().utcOffset(timezoneOffset).endOf("quarter").utc().format("YYYY-MM-DD 23:59:59");

        const { data: quarterPatientData, error: quarterPatientError } = await supabase.from("records").select("*")
        .gte("created_at", startOfQuarter).lte("created_at", endOfQuarter);
        
        if(quarterPatientError) {
            console.error(`Error getting quarter patient: ${quarterPatientError.message}`);
            return res.status(500).json({ success: false, error: quarterPatientError.message });
        }
          const dateCounts = {};

        quarterPatientData.forEach((patient) => {
         const localDate = moment(patient.created_at).utcOffset(timezoneOffset).format("YYYY-MM-DD");

      if (!dateCounts[localDate]) dateCounts[localDate] = 0;
         dateCounts[localDate]++;
    });

    return res.status(200).json({
      success: true,
      quarter: currentQuarter,
      start_of_quarter: startOfQuarter,
      end_of_quarter: endOfQuarter,
      data: dateCounts
    });
    } catch (err) {
        console.error(`Something went wrong getting quarterly patients: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
    
}

    const getYearlyPatientCount = async (req, res) => {
    try {
        const timezoneOffset = 8;
       
        const startOfYear = moment().utcOffset(timezoneOffset).startOf("year").utc().format("YYYY-MM-DD 00:00:00");
        const endOfYear = moment().utcOffset(timezoneOffset).endOf("year").utc().format("YYYY-MM-DD 23:59:59");
        
        const { data: yearlyPatientCountData, error: yearlyPatietntCountError } = await supabase.from("records").select("*")
        .gte("created_at", startOfYear).lte("created_at", endOfYear);

        if(yearlyPatietntCountError) {
            console.error(`Error getting yearly patient count: ${yearlyPatietntCountError.message}`);
            return res.status(500).json({ success: false, error: yearlyPatietntCountError.message });
        }

        const result = {
            Jan: 0,
            Feb: 0,
            Mar: 0,
            Apr: 0,
            May: 0,
            Jun: 0,
            Jul: 0,
            Aug: 0,
            Sep: 0,
            Oct: 0,
            Nov: 0,
            Dec: 0
        };

        yearlyPatientCountData.forEach((patient) => {
            const monthAbbr = moment(patient.created_at).utcOffset(timezoneOffset).format("MMM");
            result[monthAbbr]++;
        });

        const currentYear = moment().utcOffset(timezoneOffset).year();

        res.status(200).json({ 
            success: true, 
            year: currentYear, 
            data: result 
        });
    } catch (err) {
        console.error(`Something went wrong getting yearly patient count: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
}

const getWeeklyPatientsPerDepartment = async (req, res) => {
    try {
        const timezoneOffset = 8;
        const startOfWeek = moment().utcOffset(timezoneOffset).startOf("isoWeek").utc().format("YYYY-MM-DD 00:00:00");
        const endOfWeek = moment().utcOffset(timezoneOffset).endOf("isoWeek").utc().format("YYYY-MM-DD 23:59:59");

        const { data: weeklyPatientsPerDepartmentData, eror: weeklyPatientsPerDepartmentError } = await supabase.from("records").select("*")
        .gte("created_at", startOfWeek).lte("created_at", endOfWeek);

        if (weeklyPatientsPerDepartmentError) {
            console.error(`Error getting weekly patients per department: ${weeklyPatientsPerDepartmentError.message}`);
            return res.status(500).json({ success: false, error: weeklyPatientsPerDepartmentError.message });
        }
        let result = {
            Mon: { data: []},
              Mon: { data: []},
                Mon: { data: []},
                  Mon: { data: []},
                    Mon: { data: []},
                      Mon: { data: []},
        }

        res.status(200).json({ success: true, data: weeklyPatientsPerDepartmentData });
    } catch (err) {
        console.error(`Something went wrong getting weekly patients per department`);
        return res.status(500).json({ success: false, error: err.message });
    }
      
        
    }




module.exports = { getWeeklyPatients, 
                    getMonthyPatients, 
                    getQuarterlyPatient, 
                    getYearlyPatientCount,
                     getWeeklyPatientsPerDepartment}