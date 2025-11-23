import React from 'react'
import Chart from "react-apexcharts"
const PatientCountsChart = () => {
   const patientChartOptions = {
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
      text: "Weekly Patient Count",
      align: "left",
      style: {
        fontSize: "16px",
        fontWeight: "bold"
      }
    }
  };

  const patientsData = [
    {
      name: "Patients",
      data: [10, 20, 15, 30, 25, 35, 40]
    }
  ];


  return (
      <div className='w-full shadow-md rounded-lg border border-gray-200 p-5'>
                <div className='w-full flex items-center justify-between mb-3'>
                  <h3 className='text-2xl font-semibold '>Patients Count</h3>
                  <div className='group inline-block'>
                    <select
                      id='patients'
                      name='patients'
                      aria-label='Patients timeframe'
                      className='appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-md pl-3 pr-3 py-1.5 focus:outline-none transition-colors duration-150 ease-in-out'>
                        <option value='week'>This week</option>
                        <option value='month'>This month</option>
                        <option value='quarter'>This quarter</option>
                        <option value='year'>This year</option>
                    </select>
                  </div>
                </div>
                <div className='w-full h-96 md:h-80'>
                  <Chart
                    options={patientChartOptions}
                    series={patientsData}
                    type="area"
                    height="100%"
                  />
                </div>
              </div>
  )
}

export default PatientCountsChart
