import React from 'react'
import Chart from "react-apexcharts"
const MedicinesChart = () => {

     const medicineChartOptions = {
    chart: {
      id: "medicine-chart",
      toolbar: { show: false }
    },
    xaxis: {
      categories: ["Paracetamol", "Amoxicillin", "Ibuprofen", "Metformin", "Loperamide"],
    },
      colors: ["#ef4444"],
    labels: { style: { colors: '#6b7280' } },
    title: {
        text: "Stock level (%)",
        style: { fontWeight: 'bold', color: '#6b7280' }
      },
     grid: {
          borderColor: '#e5e7eb'
    },
    title: {
        text: "Top Medicines By Stock Level",
        align: "left",
        style: { fontSize: "16px", fontWeight: "bold" }
    },
    dataLabels: {
      enabled: false
    },
  }

    const medicineData = [{
    name: "Medicine",
    data: [75, 45, 30, 60, 25]
  }];
  return (
     <div className='w-full shadow-md rounded-lg border border-gray-200 p-5'>
                <div className='w-full flex items-center justify-between mb-3'>
                  <h3 className='text-2xl font-semibold '>Medicines</h3>
                  <div className='group inline-block'>
                    <select
                      id='medicines'
                      name='medicines'
                      aria-label='Medicines timeframe'
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
                    options={medicineChartOptions}
                    series={medicineData}
                    type="bar"
                    height="100%"
                  />
                </div>
              </div>
  )
}

export default MedicinesChart
