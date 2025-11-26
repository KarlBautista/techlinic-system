import React, { useEffect, useState } from 'react';
import Chart from "react-apexcharts";
import useChart from '../store/useChartStore';

const PatientCountsChart = () => {
  const [selectedCategory, setSelectedCategory] = useState("week");

  const { 
    getWeeklyPatientCount, 
    getMonthlyPatientsCount, 
    getQuarterlyPatientsCount,
    getYearlyPatientCount,
    weeklyPatientCount, 
    monthlyPatientCount,
    quarterlyPatientCount,
    yearlyPatientCount
  } = useChart();

  const [patientData, setPatientData] = useState([]);
  const [patientOptions, setPatientOptions] = useState({
    chart: { id: "patients-chart", toolbar: { show: true } },
    xaxis: { categories: [] },
    colors: ["#ef4444"],
    stroke: { curve: "smooth" },
    dataLabels: { enabled: false },
    grid: { borderColor: "#e5e7eb" },
    title: { text: "", align: "left", style: { fontSize: "16px", fontWeight: "bold" } }
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }


  useEffect(() => {
    getWeeklyPatientCount();
  }, []);


  useEffect(() => {
    if (selectedCategory === "week" && weeklyPatientCount?.data) {
      const categories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const data = categories.map(day => weeklyPatientCount.data[day] || 0);

      setPatientData(data);
      setPatientOptions(prev => ({
        ...prev,
        xaxis: { categories },
        title: {
          ...prev.title,
          text: `${formatDate(weeklyPatientCount.start_of_week)} - ${formatDate(weeklyPatientCount.end_of_week)}`
        }
      }));
    }
  }, [weeklyPatientCount, selectedCategory]);


  useEffect(() => {
    if (selectedCategory === "month" && monthlyPatientCount) {
      const categories = ["Week 1", "Week 2", "Week 3", "Week 4"];
      const data = [
        monthlyPatientCount.week1?.count || 0,
        monthlyPatientCount.week2?.count || 0,
        monthlyPatientCount.week3?.count || 0,
        monthlyPatientCount.week4?.count || 0
      ];

      const monthWord = monthNames[new Date().getMonth()];
      
      setPatientData(data);
      setPatientOptions(prev => ({
        ...prev,
        xaxis: { categories },
        title: { 
          ...prev.title, 
          text: `${monthWord} ${new Date().getFullYear()}` 
        }
      }));
    }
  }, [monthlyPatientCount, selectedCategory]);

  useEffect(() => {
    if (selectedCategory === "quarter" && quarterlyPatientCount?.data) {
      const dataObj = quarterlyPatientCount.data;
      
    
      const quarter = quarterlyPatientCount.quarter;
      const quarterMonths = [];
      
  
      const startMonthIndex = (quarter - 1) * 3;
      for (let i = 0; i < 3; i++) {
        quarterMonths.push(monthNames[startMonthIndex + i]);
      }

 
      const monthCounts = {};
      quarterMonths.forEach(month => {
        monthCounts[month] = 0;
      });

   
      Object.keys(dataObj).forEach(dateStr => {
   
        const d = new Date(dateStr + 'T00:00:00');
        const monthName = monthNames[d.getMonth()];
        if (monthCounts[monthName] !== undefined) {
          monthCounts[monthName] += dataObj[dateStr];
        }
      });

      const categories = Object.keys(monthCounts);
      const data = Object.values(monthCounts);

      setPatientData(data);
      setPatientOptions(prev => ({
        ...prev,
        xaxis: { categories },
        title: {
          ...prev.title,
          text: `Q${quarterlyPatientCount.quarter} (${formatDate(quarterlyPatientCount.start_of_quarter)} - ${formatDate(quarterlyPatientCount.end_of_quarter)})`
        }
      }));
    }
  }, [quarterlyPatientCount, selectedCategory]);


  useEffect(() => {
    if (selectedCategory === "year" && yearlyPatientCount?.data) {
      const categories = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const data = categories.map(month => yearlyPatientCount.data[month] || 0);

      setPatientData(data);
      setPatientOptions(prev => ({
        ...prev,
        xaxis: { categories },
        title: {
          ...prev.title,
          text: `Year ${yearlyPatientCount.year}`
        }
      }));
    }
  }, [yearlyPatientCount, selectedCategory]);

  const handleCategoryChange = async (value) => {
    setSelectedCategory(value);

    if (value === "week") await getWeeklyPatientCount();
    if (value === "month") await getMonthlyPatientsCount();
    if (value === "quarter") await getQuarterlyPatientsCount();
    if (value === "year") await getYearlyPatientCount();
  };

  return (
    <div className='w-full shadow-md rounded-lg border border-gray-200 p-5'>
      <div className='w-full flex items-center justify-between mb-3'>
        <h3 className='text-2xl font-semibold'>Patient Records Count</h3>

        <div className='group inline-block'>
          <select
            id='patients'
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className='appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-md pl-3 pr-3 py-1.5'
          >
            <option value='week'>This week</option>
            <option value='month'>This month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div className='w-full h-96 md:h-80'>
        {patientData.length > 0 && (
          <Chart
            key={`${selectedCategory}-${patientData.length}`}
            options={patientOptions}
            series={[{ name: "Patients", data: patientData }]}
            type="area"
            height="100%"
          />
        )}
      </div>
    </div>
  );
};

export default PatientCountsChart;