import React, { useEffect, useState } from 'react';
import Chart from "react-apexcharts";
import useChart from '../store/useChartStore';
import ChartPeriodSelector from '../components/ChartPeriodSelector';

const PatientCountsChart = () => {
  const [selectedCategory, setSelectedCategory] = useState("week");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const { 
    getWeeklyPatientCount, 
    getMonthlyPatientsCount, 
    getQuarterlyPatientsCount,
    getYearlyPatientCount,
    getCustomPatientCount,
    weeklyPatientCount, 
    monthlyPatientCount,
    quarterlyPatientCount,
    yearlyPatientCount,
    customPatientCount
  } = useChart();

  const [patientData, setPatientData] = useState([]);
  const [patientOptions, setPatientOptions] = useState({
    chart: { id: "patients-chart", toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } }, dropShadow: { enabled: true, top: 2, left: 0, blur: 4, opacity: 0.15 } },
    xaxis: { categories: [], labels: { style: { colors: '#94969C', fontWeight: 500, fontSize: '11px' } } },
    yaxis: { labels: { style: { colors: '#94969C', fontSize: '11px' } } },
    colors: ["#dc2626"],
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 90, 100] }
    },
    stroke: { curve: "smooth", width: 2.5 },
    dataLabels: { enabled: false },
    grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
    title: { text: "", align: "left", style: { fontSize: "12px", fontWeight: "normal" } },
    tooltip: { theme: 'light', style: { fontSize: '12px' }, marker: { show: true } }
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

  const handleCustomDateApply = async () => {
    if (customStart && customEnd) {
      await getCustomPatientCount(customStart, customEnd);
    }
  };

  useEffect(() => {
    if (selectedCategory === "custom" && customPatientCount) {
      setPatientData(customPatientCount.data || []);
      setPatientOptions(prev => ({
        ...prev,
        xaxis: { categories: customPatientCount.categories || [] },
        title: {
          ...prev.title,
          text: `${formatDate(customPatientCount.start_date)} - ${formatDate(customPatientCount.end_date)}`
        }
      }));
    }
  }, [customPatientCount, selectedCategory]);

  return (
    <div className='w-full h-full flex flex-col min-h-0'>
      <div className='shrink-0 flex items-start justify-between gap-2 pb-2'>
        <div className='text-sm font-semibold tracking-tight text-gray-800 dark:text-slate-100'>Patient record count</div>
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
      
      <div className='flex-1 min-h-0'>
          {patientData.length > 0 ? (
            <Chart
            key={`${selectedCategory}-${patientData.length}`}
            options={patientOptions}
            series={[{ name: "Patient Records", data: patientData }]}
            type="area"
            height="100%"
          />
        ) : (
          <div className='w-full h-full animate-pulse flex items-end gap-3 px-4 pb-6 pt-4'>
            {[35, 55, 45, 70, 50, 60, 40].map((h, i) => (
              <div key={i} className='flex-1 bg-gray-200 dark:bg-[#1F242F] rounded-t' style={{ height: `${h}%` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(PatientCountsChart);
