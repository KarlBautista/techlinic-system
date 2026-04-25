import React, { useEffect, useMemo } from 'react';
import Chart from "react-apexcharts";
import useData from '../store/useDataStore';

const MedicinesChart = ({ onInsightChange }) => {
  const { patientRecords } = useData();

  const records = useMemo(() => patientRecords?.data || [], [patientRecords]);

  const mostUsedMedicines = useMemo(() => {
    const usageMap = {};

    records.forEach((record) => {
      const diagnoses = Array.isArray(record?.diagnoses) ? record.diagnoses : [];
      diagnoses.forEach((diagnosis) => {
        const medicineName = String(diagnosis?.medication || "").trim();
        if (!medicineName) return;

        const quantity = Number(diagnosis?.quantity || 0);
        if (!usageMap[medicineName]) {
          usageMap[medicineName] = { totalDispensed: 0, timesPrescribed: 0, departments: {} };
        }

        const departmentName = String(record?.department || "Unknown Department").trim() || "Unknown Department";
        usageMap[medicineName].departments[departmentName] = (usageMap[medicineName].departments[departmentName] || 0) + (Number.isFinite(quantity) ? quantity : 0);
        usageMap[medicineName].totalDispensed += Number.isFinite(quantity) ? quantity : 0;
        usageMap[medicineName].timesPrescribed += 1;
      });
    });

    return Object.entries(usageMap)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.totalDispensed - a.totalDispensed)
      .slice(0, 5);
  }, [records]);

  useEffect(() => {
    if (typeof onInsightChange !== "function") return;

    onInsightChange({
      title: "Most Used Medicines",
      periodText: `Based on diagnosed prescriptions: ${mostUsedMedicines.length} medicine(s)`,
      labels: mostUsedMedicines.map((medicine) => medicine.name),
      values: mostUsedMedicines.map((medicine) => medicine.totalDispensed),
      usageLocations: mostUsedMedicines.map((medicine) => ({
        name: medicine.name,
        departments: medicine.departments,
      })),
    });
  }, [onInsightChange, mostUsedMedicines]);

  if (!records || records.length === 0) {
    return (
      <div className='w-full h-full flex flex-col min-h-0 animate-pulse'>
        <div className='shrink-0'>
          <div className='h-4 w-24 bg-gray-200 dark:bg-[#1F242F] rounded' />
          <div className='h-3 w-40 bg-gray-100 dark:bg-[#1F242F] rounded mt-2' />
        </div>
        <div className='flex-1 min-h-0 mt-4 flex items-end gap-3 px-4 pb-4'>
          {[40, 65, 30, 80, 50].map((h, i) => (
            <div key={i} className='flex-1 bg-gray-200 dark:bg-[#1F242F] rounded-t' style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (mostUsedMedicines.length === 0) {
    return (
      <div className='w-full h-full flex flex-col min-h-0'>
        <div className='shrink-0'>
          <div className='text-sm font-semibold tracking-tight text-gray-800 dark:text-slate-100'>Most Used Medicines</div>
          <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] mt-0.5'>No medicine usage found in diagnosis records</p>
        </div>
        <div className='flex-1 min-h-0 mt-3 flex items-center justify-center'>
          <p className='text-sm text-gray-400 dark:text-gray-500'>No usage data available</p>
        </div>
      </div>
    );
  }

  const medicineChartOptions = {
    chart: {
      id: "medicine-chart",
      toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } },
      parentHeightOffset: 0,
    },
    xaxis: {
      categories: mostUsedMedicines.map((med) => med.name),
      labels: {
        rotate: -16,
        offsetY: 4,
        hideOverlappingLabels: true,
        trim: true,
        maxHeight: 52,
        style: { colors: '#94969C', fontWeight: 500, fontSize: '11px' },
        formatter: function (value) {
          if (!value) return '';
          return value.length > 18 ? `${value.slice(0, 18)}...` : value;
        }
      }
    },
    yaxis: { labels: { style: { colors: '#94969C', fontSize: '11px' } } },
    colors: ["#dc2626"],
    fill: {
      type: 'gradient',
      gradient: { shade: 'light', type: 'vertical', shadeIntensity: 0.3, opacityFrom: 1, opacityTo: 0.85, stops: [0, 100] }
    },
    grid: {
      borderColor: '#f3f4f6',
      strokeDashArray: 4,
      padding: { left: 4, right: 8, top: 8, bottom: 10 }
    },
    dataLabels: { enabled: false },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '48%',
      }
    },
    states: {
      hover: {
        filter: { type: 'lighten', value: 0.15 }
      }
    },
    tooltip: {
      theme: 'light',
      shared: false,
      intersect: false,
      followCursor: true,
      style: { fontSize: '12px' }
    }
  };

  const medicineData = [{
    name: "Total Dispensed",
    data: mostUsedMedicines.map((med) => med.totalDispensed)
  }];

  return (
    <div className='w-full h-full flex flex-col min-h-0'>
      <div className='shrink-0'>
        <div className='text-sm font-semibold tracking-tight text-gray-800 dark:text-slate-100'>Most Used Medicines</div>
        <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] mt-0.5'>Top 5 by total dispensed quantity</p>
      </div>  
      <div className='flex-1 min-h-0 mt-3 pb-1'>
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
