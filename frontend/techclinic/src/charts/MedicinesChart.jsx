import React from 'react';
import Chart from "react-apexcharts";
import useMedicine from '../store/useMedicineStore';

const MedicinesChart = () => {
  const { medicines } = useMedicine();

  if (!medicines || medicines.length === 0) {
    return <p>Loading medicines...</p>; 
  }

  const sortedMedicines = [...medicines].sort((a, b) => a.stock_level - b.stock_level);
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
    <div className='w-full h-full flex flex-col min-h-0'>
      <div className='shrink-0'>
        <div className='text-sm font-semibold text-gray-800'>Lowest Stock</div>
        <p className='text-xs text-gray-400 mt-0.5'>Total medicines tracked: {medicines.length}</p> 
      </div>  
      <div className='flex-1 min-h-0 mt-2'>
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

export default React.memo(MedicinesChart);
