import React, { useEffect, useState } from 'react';
import Chart from "react-apexcharts";
import useChart from '../store/useChartStore';

const PatientCountsChart = () => {
  const [selectedCategory, setSelectedCategory] = useState("week");

  const { 
    getWeeklyPatientCount, 
    getMonthlyPatientsCount, 
    weeklyPatientCount, 
    monthlyPatientCount 
  } = useChart();

  const [patientData, setPatientData] = useState([]);

  const [patientOptions, setPatientOptions] = useState({
    chart: { id: "patients-chart", toolbar: { show: true } },
    xaxis: { categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
    colors: ["#ef4444"],
    stroke: { curve: "smooth" },
    dataLabels: { enabled: false },
    grid: { borderColor: "#e5e7eb" },
    title: { text: "", align: "left", style: { fontSize: "16px", fontWeight: "bold" } }
  });

  const chartCategories = {
    week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    month: ["Week 1", "Week 2", "Week 3", "Week 4"]
  };

  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const monthWord = monthNames[new Date().getMonth()];




  useEffect(() => {
    getWeeklyPatientCount();
  }, []);


  useEffect(() => {
    if (selectedCategory === "week" && weeklyPatientCount) {
      setPatientData(Object.values(weeklyPatientCount.data));

      
      setPatientOptions(prev => ({
        ...prev,
        title: {
          ...prev.title,
          text: `${formatDate(weeklyPatientCount.start_of_week)} - ${formatDate(weeklyPatientCount.end_of_week)}`
        }
      }));
    }

    if (selectedCategory === "month" && monthlyPatientCount) {
      // update data
      setPatientData([
        monthlyPatientCount.week1.count,
        monthlyPatientCount.week2.count,
        monthlyPatientCount.week3.count,
        monthlyPatientCount.week4.count
      ]);

      // update title
      setPatientOptions(prev => ({
        ...prev,
        title: { ...prev.title, text: `${monthWord} ${new Date().getFullYear()}`}
      }));
    }
  }, [weeklyPatientCount, monthlyPatientCount, selectedCategory]);



  const handleCategoryChange = async (value) => {
  setSelectedCategory(value);


  setPatientOptions({
    ...patientOptions,
    xaxis: {
      categories: chartCategories[value]
    }
  });

  if (value === "week") {
    getWeeklyPatientCount();
  }

  if (value === "month") {
    getMonthlyPatientsCount();
  }
};
  console.log(patientData)


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
          </select>
        </div>
      </div>

      <div className='w-full h-96 md:h-80'>
       <Chart
  options={{ ...patientOptions }}  
  series={[{ name: "Patients", data: [...patientData] }]}  
  type="area"
  height="100%"
/>
      </div>
    </div>
  );
};

export default PatientCountsChart;
