import React, { useEffect, useMemo, useState } from 'react';
import Chart from "react-apexcharts";
import useData from '../store/useDataStore';
import ChartPeriodSelector from '../components/ChartPeriodSelector';

const MedicinesChart = ({ onInsightChange }) => {
  const { patientRecords } = useData();
  const [selectedCategory, setSelectedCategory] = useState("week");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const records = useMemo(() => patientRecords?.data || [], [patientRecords]);

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const getDateRange = () => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (selectedCategory === "week") {
      const day = now.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      start.setDate(now.getDate() + diffToMonday);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (selectedCategory === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (selectedCategory === "quarter") {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      start.setMonth(quarterStartMonth, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(quarterStartMonth + 3, 0);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (selectedCategory === "year") {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    if (selectedCategory === "custom") {
      if (!customStart || !customEnd) return null;
      const customStartDate = new Date(customStart);
      const customEndDate = new Date(customEnd);
      customStartDate.setHours(0, 0, 0, 0);
      customEndDate.setHours(23, 59, 59, 999);
      return { start: customStartDate, end: customEndDate };
    }

    return null;
  };

  const periodText = useMemo(() => {
    const range = getDateRange();
    if (!range) {
      return selectedCategory === "custom" ? "Custom range" : "";
    }

    if (selectedCategory === "week") {
      return `${formatDate(range.start)} - ${formatDate(range.end)}`;
    }

    if (selectedCategory === "month") {
      return range.start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }

    if (selectedCategory === "quarter") {
      const quarter = Math.floor(range.start.getMonth() / 3) + 1;
      return `Q${quarter} (${formatDate(range.start)} - ${formatDate(range.end)})`;
    }

    if (selectedCategory === "year") {
      return `Year ${range.start.getFullYear()}`;
    }

    return `${formatDate(range.start)} - ${formatDate(range.end)}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, customStart, customEnd]);

  const filteredRecords = useMemo(() => {
    const range = getDateRange();
    if (!range) {
      return selectedCategory === "custom" ? [] : records;
    }

    return records.filter((record) => {
      if (!record?.created_at) return false;
      const date = new Date(record.created_at);
      return date >= range.start && date <= range.end;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, selectedCategory, customStart, customEnd]);

  const mostUsedMedicines = useMemo(() => {
    const usageMap = {};

    filteredRecords.forEach((record) => {
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
  }, [filteredRecords]);

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handleCustomDateApply = () => {
    if (!customStart || !customEnd) return;
  };

  useEffect(() => {
    if (typeof onInsightChange !== "function") return;

    onInsightChange({
      title: "Most Used Medicines",
      periodText: periodText || "Selected period",
      labels: mostUsedMedicines.map((medicine) => medicine.name),
      values: mostUsedMedicines.map((medicine) => medicine.totalDispensed),
      usageLocations: mostUsedMedicines.map((medicine) => ({
        name: medicine.name,
        departments: medicine.departments,
      })),
    });
  }, [onInsightChange, mostUsedMedicines, periodText]);

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
        <div className='shrink-0 flex items-start justify-between gap-2'>
          <div>
            <div className='text-sm font-semibold tracking-tight text-gray-800 dark:text-slate-100'>Most Used Medicines</div>
            <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] mt-0.5'>{periodText || 'Selected period'}</p>
          </div>
          <ChartPeriodSelector
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            customStart={customStart}
            customEnd={customEnd}
            onCustomStartChange={setCustomStart}
            onCustomEndChange={setCustomEnd}
            onCustomApply={handleCustomDateApply}
          />
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
      <div className='shrink-0 flex items-start justify-between gap-2'>
        <div>
          <div className='text-sm font-semibold tracking-tight text-gray-800 dark:text-slate-100'>Most Used Medicines</div>
          <p className='text-xs font-medium text-gray-400 dark:text-[#94969C] mt-0.5'>{periodText || 'Selected period'}</p>
        </div>
        <ChartPeriodSelector
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
          onCustomApply={handleCustomDateApply}
        />
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
