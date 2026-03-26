import React from 'react';
import Chart from "react-apexcharts";
import useMedicine from '../store/useMedicineStore';

const MedicinesChart = () => {
  const { medicines } = useMedicine();

  if (!medicines || medicines.length === 0) {
    return (
      <div className='w-full h-full flex flex-col min-h-0 animate-pulse'>
        <div className='shrink-0'>
          <div className='h-4 w-24 bg-gray-200 rounded' />
          <div className='h-3 w-40 bg-gray-100 rounded mt-2' />
        </div>
        <div className='flex-1 min-h-0 mt-4 flex items-end gap-3 px-4 pb-4'>
          {[40, 65, 30, 80, 50].map((h, i) => (
            <div key={i} className='flex-1 bg-gray-200 rounded-t' style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    );
  }

  const sortedMedicines = [...medicines].sort((a, b) => a.stock_level - b.stock_level);
  const lowStockMedicines = sortedMedicines.slice(0, 5);

  const medicineChartOptions = {
    chart: {
      id: "medicine-chart",
      toolbar: { show: true },
    },
    xaxis: {
      categories: lowStockMedicines.map(med => med.medicine_name),
      labels: { style: { colors: '#9ca3af', fontWeight: 500, fontSize: '11px' } }
    },
    yaxis: { labels: { style: { colors: '#9ca3af', fontSize: '11px' } } },
    colors: ["#dc2626"],
    fill: {
      type: 'gradient',
      gradient: { shade: 'light', type: 'vertical', shadeIntensity: 0.3, opacityFrom: 1, opacityTo: 0.85, stops: [0, 100] }
    },
    grid: {
      borderColor: '#f3f4f6',
      strokeDashArray: 4
    },
    dataLabels: {
      enabled: true,
      style: { fontSize: '11px', fontWeight: 600, colors: ['#fff'] },
      dropShadow: { enabled: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '55%',
      }
    },
    tooltip: { theme: 'light', style: { fontSize: '12px' } }
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
