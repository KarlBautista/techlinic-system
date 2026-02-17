const supabase = require("../config/supabaseAdmin");
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
        const startOfWeek = moment().utcOffset(timezoneOffset).startOf("isoWeek");
        const endOfWeek = moment().utcOffset(timezoneOffset).endOf("isoWeek");
        
        const startOfWeekUTC = startOfWeek.clone().utc().format("YYYY-MM-DD 00:00:00");
        const endOfWeekUTC = endOfWeek.clone().utc().format("YYYY-MM-DD 23:59:59");

        const { data: weeklyPatientsPerDepartmentData, error: weeklyPatientsPerDepartmentError } = await supabase
            .from("records")
            .select("*")
            .gte("created_at", startOfWeekUTC)
            .lte("created_at", endOfWeekUTC);

        if (weeklyPatientsPerDepartmentError) {
            console.error(`Error getting weekly patients per department: ${weeklyPatientsPerDepartmentError.message}`);
            return res.status(500).json({ success: false, error: weeklyPatientsPerDepartmentError.message });
        }

        const departments = [
            "College of Architecture and Fine Arts",
            "College of Science",
            "College of Liberal Arts",
            "College of Industrial Education",
            "College of Engineering",
            "College of Industrial Technology"
        ];

        let data = {};
        departments.forEach(dept => {
            data[dept] = 0;
        });

        weeklyPatientsPerDepartmentData?.forEach((patient) => {
            const department = patient.department;
            
            if (data[department] !== undefined) {
                data[department]++;
            }
        });

        res.status(200).json({ 
            success: true, 
            data: data,
            period: {
                type: "week",
                startDate: startOfWeek.format("MMMM DD, YYYY"),
                endDate: endOfWeek.format("MMMM DD, YYYY"),
                startDay: startOfWeek.format("dddd"),
                endDay: endOfWeek.format("dddd"),
                range: `${startOfWeek.format("MMM DD")} - ${endOfWeek.format("MMM DD, YYYY")}`
            }
        });
    } catch (err) {
        console.error(`Something went wrong getting weekly patients per department: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
};

const getMonthlyPatientsPerDepartment = async (req, res) => {
    try {
        const timezoneOffset = 8;
        const startOfMonth = moment().utcOffset(timezoneOffset).startOf("month");
        const endOfMonth = moment().utcOffset(timezoneOffset).endOf("month");
        
        const startOfMonthUTC = startOfMonth.clone().utc().format("YYYY-MM-DD 00:00:00");
        const endOfMonthUTC = endOfMonth.clone().utc().format("YYYY-MM-DD 23:59:59");

        const { data: monthlyPatientsPerDepartmentData, error: monthlyPatientsPerDepartmentError } = await supabase
            .from("records")
            .select("*")
            .gte("created_at", startOfMonthUTC)
            .lte("created_at", endOfMonthUTC);

        if (monthlyPatientsPerDepartmentError) {
            console.error(`Error getting monthly patients per department: ${monthlyPatientsPerDepartmentError.message}`);
            return res.status(500).json({ success: false, error: monthlyPatientsPerDepartmentError.message });
        }

        const departments = [
            "College of Architecture and Fine Arts",
            "College of Science",
            "College of Liberal Arts",
            "College of Industrial Education",
            "College of Engineering",
            "College of Industrial Technology"
        ];

        let data = {};
        departments.forEach(dept => {
            data[dept] = 0;
        });

        monthlyPatientsPerDepartmentData?.forEach((patient) => {
            const department = patient.department;
            
            if (data[department] !== undefined) {
                data[department]++;
            }
        });

        res.status(200).json({ 
            success: true, 
            data: data,
            period: {
                type: "month",
                month: startOfMonth.format("MMMM YYYY"),
                startDate: startOfMonth.format("MMMM DD, YYYY"),
                endDate: endOfMonth.format("MMMM DD, YYYY"),
                range: startOfMonth.format("MMMM YYYY")
            }
        });
    } catch (err) {
        console.error(`Something went wrong getting monthly patients per department: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
};

const getQuarterlyPatientsPerDepartment = async (req, res) => {
    try {
        const timezoneOffset = 8;
        const startOfQuarter = moment().utcOffset(timezoneOffset).startOf("quarter");
        const endOfQuarter = moment().utcOffset(timezoneOffset).endOf("quarter");
        
        const startOfQuarterUTC = startOfQuarter.clone().utc().format("YYYY-MM-DD 00:00:00");
        const endOfQuarterUTC = endOfQuarter.clone().utc().format("YYYY-MM-DD 23:59:59");

        const { data: quarterlyPatientsPerDepartmentData, error: quarterlyPatientsPerDepartmentError } = await supabase
            .from("records")
            .select("*")
            .gte("created_at", startOfQuarterUTC)
            .lte("created_at", endOfQuarterUTC);

        if (quarterlyPatientsPerDepartmentError) {
            console.error(`Error getting quarterly patients per department: ${quarterlyPatientsPerDepartmentError.message}`);
            return res.status(500).json({ success: false, error: quarterlyPatientsPerDepartmentError.message });
        }

        const departments = [
            "College of Architecture and Fine Arts",
            "College of Science",
            "College of Liberal Arts",
            "College of Industrial Education",
            "College of Engineering",
            "College of Industrial Technology"
        ];

        let data = {};
        departments.forEach(dept => {
            data[dept] = 0;
        });

        quarterlyPatientsPerDepartmentData?.forEach((patient) => {
            const department = patient.department;
            
            if (data[department] !== undefined) {
                data[department]++;
            }
        });

    
        const quarterNumber = startOfQuarter.quarter();
        const year = startOfQuarter.year();
        
 
        const months = [];
        for (let i = 0; i < 3; i++) {
            months.push(startOfQuarter.clone().add(i, 'months').format("MMMM"));
        }

        res.status(200).json({ 
            success: true, 
            data: data,
            period: {
                type: "quarter",
                quarter: `Q${quarterNumber} ${year}`,
                quarterNumber: quarterNumber,
                year: year,
                months: months,
                startDate: startOfQuarter.format("MMMM DD, YYYY"),
                endDate: endOfQuarter.format("MMMM DD, YYYY"),
                range: `${months.join(", ")} ${year}`
            }
        });
    } catch (err) {
        console.error(`Something went wrong getting quarterly patients per department: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
};

const getYearlyPatientsPerDepartment = async (req, res) => {
    try {
        const timezoneOffset = 8;
        const startOfYear = moment().utcOffset(timezoneOffset).startOf("year");
        const endOfYear = moment().utcOffset(timezoneOffset).endOf("year");
        
        const startOfYearUTC = startOfYear.clone().utc().format("YYYY-MM-DD 00:00:00");
        const endOfYearUTC = endOfYear.clone().utc().format("YYYY-MM-DD 23:59:59");

        const { data: yearlyPatientsPerDepartmentData, error: yearlyPatientsPerDepartmentError } = await supabase
            .from("records")
            .select("*")
            .gte("created_at", startOfYearUTC)
            .lte("created_at", endOfYearUTC);

        if (yearlyPatientsPerDepartmentError) {
            console.error(`Error getting yearly patients per department: ${yearlyPatientsPerDepartmentError.message}`);
            return res.status(500).json({ success: false, error: yearlyPatientsPerDepartmentError.message });
        }

        const departments = [
            "College of Architecture and Fine Arts",
            "College of Science",
            "College of Liberal Arts",
            "College of Industrial Education",
            "College of Engineering",
            "College of Industrial Technology"
        ];

        let data = {};
        departments.forEach(dept => {
            data[dept] = 0;
        });

        yearlyPatientsPerDepartmentData?.forEach((patient) => {
            const department = patient.department;
            
            if (data[department] !== undefined) {
                data[department]++;
            }
        });

        const year = startOfYear.year();

        res.status(200).json({ 
            success: true, 
            data: data,
            period: {
                type: "year",
                year: year,
                startDate: startOfYear.format("MMMM DD, YYYY"),
                endDate: endOfYear.format("MMMM DD, YYYY"),
                range: year.toString()
            }
        });
    } catch (err) {
        console.error(`Something went wrong getting yearly patients per department: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
};


// Helper function to get top N diagnoses from data
const getTopDiagnoses = (diagnosesData, topN = 5) => {
    const diagnosisCount = {};
    
    // Count occurrences of each diagnosis
    diagnosesData.forEach(record => {
        const diagnosis = record.diagnosis;
        diagnosisCount[diagnosis] = (diagnosisCount[diagnosis] || 0) + 1;
    });
    
    // Sort by count and get top N
    const sortedDiagnoses = Object.entries(diagnosisCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);
    
    return sortedDiagnoses;
};

// Helper function to calculate cumulative percentage
const calculateCumulativePercent = (counts) => {
    const total = counts.reduce((sum, count) => sum + count, 0);
    let cumulative = 0;
    return counts.map(count => {
        cumulative += count;
        return Math.round((cumulative / total) * 100);
    });
};

// WEEKLY - Group by day (Monday to Sunday)
const getWeeklyTopDiagnoses = async (req, res) => {
    try {
        const timezoneOffset = 8;
        const startOfWeek = moment().utcOffset(timezoneOffset).startOf("isoWeek").utc().format("YYYY-MM-DD 00:00:00");
        const endOfWeek = moment().utcOffset(timezoneOffset).endOf("isoWeek").utc().format("YYYY-MM-DD 23:59:59");

        const { data: weeklyDiagnosesData, error: weeklyDiagnosesError } = await supabase
            .from("diagnoses")
            .select("*")
            .gte("created_at", startOfWeek)
            .lte("created_at", endOfWeek);

        if (weeklyDiagnosesError) {
            console.error(`Error getting weekly top diagnoses: ${weeklyDiagnosesError.message}`);
            return res.status(500).json({ success: false, error: weeklyDiagnosesError.message });
        }

        // Get top 5 diagnoses
        const topDiagnoses = getTopDiagnoses(weeklyDiagnosesData, 5);
        const diagnosisNames = topDiagnoses.map(d => d[0]);
        const diagnosisCounts = topDiagnoses.map(d => d[1]);
        
        // Group by day for each top diagnosis
        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const seriesData = diagnosisNames.map(diagnosisName => {
            const dayData = new Array(7).fill(0);
            
            weeklyDiagnosesData
                .filter(record => record.diagnosis === diagnosisName)
                .forEach(record => {
                    const dayIndex = moment(record.created_at).utcOffset(timezoneOffset).isoWeekday() - 1;
                    dayData[dayIndex]++;
                });
            
            return {
                name: diagnosisName,
                data: dayData
            };
        });

        const cumulativePercent = calculateCumulativePercent(diagnosisCounts);

        res.status(200).json({
            success: true,
            data: {
                labels: daysOfWeek,
                series: seriesData,
                topDiagnosesCount: diagnosisCounts,
                topDiagnosesNames: diagnosisNames,
                cumulativePercent: cumulativePercent,
                period: {
                    type: "week",
                    range: `${moment(startOfWeek).format("MMM DD")} - ${moment(endOfWeek).format("MMM DD, YYYY")}`
                }
            }
        });
    } catch (err) {
        console.error(`Something went wrong getting weekly diagnoses: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// MONTHLY - Group by week (Week 1, Week 2, etc.)
const getMonthlyTopDiagnoses = async (req, res) => {
    try {
        const timezoneOffset = 8;
        const startOfMonth = moment().utcOffset(timezoneOffset).startOf("month").utc().format("YYYY-MM-DD 00:00:00");
        const endOfMonth = moment().utcOffset(timezoneOffset).endOf("month").utc().format("YYYY-MM-DD 23:59:59");

        const { data: monthlyDiagnosesData, error: monthlyDiagnosesError } = await supabase
            .from("diagnoses")
            .select("*")
            .gte("created_at", startOfMonth)
            .lte("created_at", endOfMonth);

        if (monthlyDiagnosesError) {
            console.error(`Error getting monthly top diagnoses: ${monthlyDiagnosesError.message}`);
            return res.status(500).json({ success: false, error: monthlyDiagnosesError.message });
        }

        const topDiagnoses = getTopDiagnoses(monthlyDiagnosesData, 5);
        const diagnosisNames = topDiagnoses.map(d => d[0]);
        const diagnosisCounts = topDiagnoses.map(d => d[1]);

        // Calculate number of weeks in the month
        const weeksInMonth = Math.ceil(moment().utcOffset(timezoneOffset).daysInMonth() / 7);
        const weekLabels = Array.from({ length: weeksInMonth }, (_, i) => `Week ${i + 1}`);

        // Group by week for each top diagnosis
        const seriesData = diagnosisNames.map(diagnosisName => {
            const weekData = new Array(weeksInMonth).fill(0);
            
            monthlyDiagnosesData
                .filter(record => record.diagnosis === diagnosisName)
                .forEach(record => {
                    const dayOfMonth = moment(record.created_at).utcOffset(timezoneOffset).date();
                    const weekIndex = Math.floor((dayOfMonth - 1) / 7);
                    weekData[weekIndex]++;
                });
            
            return {
                name: diagnosisName,
                data: weekData
            };
        });

        const cumulativePercent = calculateCumulativePercent(diagnosisCounts);

        res.status(200).json({
            success: true,
            data: {
                labels: weekLabels,
                series: seriesData,
                topDiagnosesCount: diagnosisCounts,
                topDiagnosesNames: diagnosisNames,
                cumulativePercent: cumulativePercent,
                period: {
                    type: "month",
                    month: moment().format("MMMM YYYY")
                }
            }
        });
    } catch (err) {
        console.error(`Something went wrong getting monthly diagnoses: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// QUARTERLY - Group by month within the quarter
const getQuarterlyTopDiagnoses = async (req, res) => {
    try {
        const timezoneOffset = 8;
        const startOfQuarter = moment().utcOffset(timezoneOffset).startOf("quarter").utc().format("YYYY-MM-DD 00:00:00");
        const endOfQuarter = moment().utcOffset(timezoneOffset).endOf("quarter").utc().format("YYYY-MM-DD 23:59:59");

        const { data: quarterlyDiagnosesData, error: quarterlyDiagnosesError } = await supabase
            .from("diagnoses")
            .select("*")
            .gte("created_at", startOfQuarter)
            .lte("created_at", endOfQuarter);

        if (quarterlyDiagnosesError) {
            console.error(`Error getting quarterly top diagnoses: ${quarterlyDiagnosesError.message}`);
            return res.status(500).json({ success: false, error: quarterlyDiagnosesError.message });
        }

        const topDiagnoses = getTopDiagnoses(quarterlyDiagnosesData, 5);
        const diagnosisNames = topDiagnoses.map(d => d[0]);
        const diagnosisCounts = topDiagnoses.map(d => d[1]);

        // Get months in current quarter
        const quarterMonths = [];
        for (let i = 0; i < 3; i++) {
            quarterMonths.push(moment().startOf("quarter").add(i, "months").format("MMMM"));
        }

        // Group by month for each top diagnosis
        const seriesData = diagnosisNames.map(diagnosisName => {
            const monthData = new Array(3).fill(0);
            
            quarterlyDiagnosesData
                .filter(record => record.diagnosis === diagnosisName)
                .forEach(record => {
                    const recordMonth = moment(record.created_at).utcOffset(timezoneOffset).month();
                    const quarterStartMonth = moment().startOf("quarter").month();
                    const monthIndex = recordMonth - quarterStartMonth;
                    if (monthIndex >= 0 && monthIndex < 3) {
                        monthData[monthIndex]++;
                    }
                });
            
            return {
                name: diagnosisName,
                data: monthData
            };
        });

        const cumulativePercent = calculateCumulativePercent(diagnosisCounts);
        const currentQuarter = moment().quarter();

        res.status(200).json({
            success: true,
            data: {
                labels: quarterMonths,
                series: seriesData,
                topDiagnosesCount: diagnosisCounts,
                topDiagnosesNames: diagnosisNames,
                cumulativePercent: cumulativePercent,
                period: {
                    type: "quarter",
                    quarter: `Quarter ${currentQuarter}`,
                    range: `${moment(startOfQuarter).format("MMM")} - ${moment(endOfQuarter).format("MMM YYYY")}`
                }
            }
        });
    } catch (err) {
        console.error(`Something went wrong getting quarterly diagnoses: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
};

// YEARLY - Group by month (January to December)
const getYearlyTopDiagnoses = async (req, res) => {
    try {
        const timezoneOffset = 8;
        const startOfYear = moment().utcOffset(timezoneOffset).startOf("year").utc().format("YYYY-MM-DD 00:00:00");
        const endOfYear = moment().utcOffset(timezoneOffset).endOf("year").utc().format("YYYY-MM-DD 23:59:59");

        const { data: yearlyDiagnosesData, error: yearlyDiagnosesError } = await supabase
            .from("diagnoses")
            .select("*")
            .gte("created_at", startOfYear)
            .lte("created_at", endOfYear);

        if (yearlyDiagnosesError) {
            console.error(`Error getting yearly top diagnoses: ${yearlyDiagnosesError.message}`);
            return res.status(500).json({ success: false, error: yearlyDiagnosesError.message });
        }

        const topDiagnoses = getTopDiagnoses(yearlyDiagnosesData, 5);
        const diagnosisNames = topDiagnoses.map(d => d[0]);
        const diagnosisCounts = topDiagnoses.map(d => d[1]);

        const monthsOfYear = moment.months(); // ["January", "February", ..., "December"]

        // Group by month for each top diagnosis
        const seriesData = diagnosisNames.map(diagnosisName => {
            const monthData = new Array(12).fill(0);
            
            yearlyDiagnosesData
                .filter(record => record.diagnosis === diagnosisName)
                .forEach(record => {
                    const monthIndex = moment(record.created_at).utcOffset(timezoneOffset).month();
                    monthData[monthIndex]++;
                });
            
            return {
                name: diagnosisName,
                data: monthData
            };
        });

        const cumulativePercent = calculateCumulativePercent(diagnosisCounts);

        res.status(200).json({
            success: true,
            data: {
                labels: monthsOfYear,
                series: seriesData,
                topDiagnosesCount: diagnosisCounts,
                topDiagnosesNames: diagnosisNames,
                cumulativePercent: cumulativePercent,
                period: {
                    type: "year",
                    year: moment().year()
                }
            }
        });
    } catch (err) {
        console.error(`Something went wrong getting yearly diagnoses: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
};





const getMostUsedMedicines = async (req, res) => {
    try {
        const { data: diagnoses, error } = await supabase
            .from("diagnoses")
            .select("medication, quantity")
            .not("medication", "is", null)
            .neq("medication", "");

        if (error) {
            console.error(`Error getting most used medicines: ${error.message}`);
            return res.status(500).json({ success: false, error: error.message });
        }

        // Aggregate total dispensed quantity per medicine
        const usageMap = {};
        diagnoses.forEach((d) => {
            const name = d.medication.trim();
            const qty = parseInt(d.quantity, 10) || 0;
            if (!usageMap[name]) {
                usageMap[name] = { totalDispensed: 0, timesPrescribed: 0 };
            }
            usageMap[name].totalDispensed += qty;
            usageMap[name].timesPrescribed += 1;
        });

        // Convert to sorted array (top 10 by total dispensed)
        const sorted = Object.entries(usageMap)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.totalDispensed - a.totalDispensed)
            .slice(0, 10);

        return res.status(200).json({ success: true, data: sorted });
    } catch (err) {
        console.error(`Something went wrong getting most used medicines: ${err.message}`);
        return res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { getWeeklyPatients, 
                    getMonthyPatients, 
                    getQuarterlyPatient, 
                    getYearlyPatientCount,
                     getWeeklyPatientsPerDepartment,
                    getMonthlyPatientsPerDepartment,
                getQuarterlyPatientsPerDepartment,
            getYearlyPatientsPerDepartment, 
            getWeeklyTopDiagnoses,
    getMonthlyTopDiagnoses,
    getQuarterlyTopDiagnoses,
    getYearlyTopDiagnoses,
    getMostUsedMedicines
        }