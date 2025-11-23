import React, { useEffect, useState } from 'react'
import Chart from "react-apexcharts"
import useData from '../store/useDataStore';
import useChart from '../store/useChartStore';
const PatientCountsChart = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const { getWeeklyPatientCount, weeklyPatientCount } = useChart();
  const [patientData, setPatientData] = useState([]);
  const [patientOptions, setPatientOptions] = useState({
    chart: {
      id: "patients-chart",
      toolbar: { show: false }
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    colors: ["#ef4444"],
    stroke: {
      curve: "smooth"
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: "#e5e7eb"
    },
    title: {
      align: "left",
      style: {
        fontSize: "16px",
        fontWeight: "bold"
      }
    }
  });

  useEffect(() => {
    getWeeklyPatientCount();
  }, []);

  useEffect(() => {
    if (!weeklyPatientCount) return;
    setPatientData(Object.values(weeklyPatientCount));
  
  }, [weeklyPatientCount])

  const chartCategories = {
    week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    month: ["Week 1", "Week 2", "Week 3", "Week 4"],
    quarter: ["Q1", "Q2", "Q3", "Q4"],
    year: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setPatientOptions({...patientOptions, xaxis: {...patientOptions.xaxis, categories: chartCategories[value]}});
    if(value === "week") {
      setPatientData(Object.values(weeklyPatientCount));
    }
  
  };

 

  return (
    <div className='w-full shadow-md rounded-lg border border-gray-200 p-5'>
      <div className='w-full flex items-center justify-between mb-3'>
        <h3 className='text-2xl font-semibold'>Patient Records Count</h3>

        <div className='group inline-block'>
          <select
            id='patients'
            name='patients'
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            aria-label='Patients timeframe'
            className='appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-md pl-3 pr-3 py-1.5 focus:outline-none transition-colors duration-150 ease-in-out'
          >
            <option value='week'>This week</option>
            <option value='month'>This month</option>
            <option value='quarter'>This quarter</option>
            <option value='year'>This year</option>
          </select>
        </div>
      </div>

      <div className='w-full h-96 md:h-80'>
        <Chart
          key={selectedCategory}
          options={patientOptions}
          series={[
            {
              name: "Patients",
              data: patientData
            }
          ]}
          type="area"
          height="100%"
        />
      </div>
    </div>
  );
};

export default PatientCountsChart;
