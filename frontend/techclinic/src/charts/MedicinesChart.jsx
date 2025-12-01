import React from 'react';
import Chart from "react-apexcharts";
import useMedicine from '../store/useMedicineStore';

const MedicinesChart = () => {
  const { medicines } = useMedicine();

  // Wait for medicines to load
  if (!medicines || medicines.length === 0) {
    return <p>Loading medicines...</p>; // or a spinner
  }

  // Sort medicines by stock_level ascending
  const sortedMedicines = [...medicines].sort((a, b) => a.stock_level - b.stock_level);

  // Take top 5 lowest stock medicines
  const lowStockMedicines = sortedMedicines.slice(0, 5);

  const medicineChartOptions = {
    chart: {
      id: "medicine-chart",
      toolbar: { show: true }
    },
    xaxis: {
      categories: lowStockMedicines.map(med => med.medicine_name),
    },
    colors: ["#ef4444"],
    labels: { style: { colors: '#6b7280' } },
    grid: {
      borderColor: '#e5e7eb'
    },
    dataLabels: {
      enabled: false
    },
  };

  const medicineData = [{
    name: "Stock",
    data: lowStockMedicines.map(med => med.stock_level)
  }];

  return (
    <div className='w-full h-full'>
      <div className='h-[10%] w-full'>
        <div className='text-[.9rem] font-semibold'>Most use stock</div>
      </div>  
      <div className='h-[90%] w-full '>
       <Chart
          options={medicineChartOptions}
          series={medicineData}
          type="bar"
          height="100%"
        />
      </div>
    
    
    
    
     {/* <div className='w-full flex items-center justify-between mb-3'>
        <h3 className='text-2xl font-semibold '>Low Stock Medicines</h3>
        <div className='group inline-block'>
          <select
            id='medicines'
            name='medicines'
            aria-label='Medicines timeframe'
            className='appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-md pl-3 pr-3 py-1.5 focus:outline-none transition-colors duration-150 ease-in-out'>
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
      <p className='text-gray-500 mt-2'>Total medicines tracked: {medicines.length}</p> */}
    </div>
  )
}

export default MedicinesChart;
