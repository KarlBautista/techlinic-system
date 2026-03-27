import React, { useEffect, useState } from 'react'
import Chart from "react-apexcharts"
import useChart from '../store/useChartStore';
import ChartPeriodSelector from '../components/ChartPeriodSelector';

const PatientsPerDepartmentChart = () => {
  const { 
    getWeeklyPatientPerDepartmentCount, 
    getMonthlyPatientPerDepartmentCount, 
    getQuarterlyPatientPerDepartmentCount, 
    getYearlyPatientPerDepartmentCount,
    getCustomPatientPerDepartmentCount,
    weeklyPatientPerDepartment, 
    monthlyPatientPerDepartment,
    quarterlyPatientPerDepartment, 
    yearlyPatientPerDepartment,
    customPatientPerDepartment
  } = useChart();
  
  const [selectedCategory, setSelectedCategory] = useState("week");
  const [patientData, setPatientData] = useState([]);
  const [periodInfo, setPeriodInfo] = useState(null);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [patientOptions, setPatientOptions] = useState({
    chart: {
      type: "donut",
      size: "100%",
      id: "patient-per-department",
      toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } },
      toolbar: { show: false },
      dropShadow: { enabled: true, top: 2, left: 0, blur: 6, opacity: 0.12 }
    },
    labels: [],
    colors: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'],
    stroke: { width: 2, colors: ['#fff'] },
    title: {
      text: '',
      align: 'left',
      style: {
        fontSize: '12px',  
        fontWeight: 'normal',
        color: '#94969C'
      }
    },
    legend: {
      position: 'bottom',
      fontSize: '11px',
      fontWeight: 500,
      markers: { width: 10, height: 10, radius: 3 },
      itemMargin: { horizontal: 8, vertical: 6 }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        return opts.w.config.series[opts.seriesIndex];
      },
      style: { fontSize: '12px', fontWeight: 600 },
      dropShadow: { enabled: false }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '62%',
          labels: {
            show: true,
            name: {
              show: false
            },
            value: {
              show: true,
              fontSize: '19px',
              fontWeight: 700,
              color: '#e7efff',
              offsetY: 6,
              formatter: function (value) {
                return Math.round(value);
              }
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '11px',
              fontWeight: 600,
              color: '#94969C',
              showAlways: true,
              offsetY: -12,
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              }
            }
          }
        }
      }
    },
    tooltip: {
      theme: 'light',
      style: { fontSize: '12px' },
      y: {
        formatter: function(value) {
          return value + " patients";
        }
      }
    }
  });


  useEffect(() => {
    getWeeklyPatientPerDepartmentCount();
  }, []);


  useEffect(() => {
    let currentData = null;

  
    switch(selectedCategory) {
      case "week":
        currentData = weeklyPatientPerDepartment;
        break;
      case "month":
        currentData = monthlyPatientPerDepartment;
        break;
      case "quarter":
        currentData = quarterlyPatientPerDepartment;
        break;
      case "year":
        currentData = yearlyPatientPerDepartment;
        break;
      case "custom":
        currentData = customPatientPerDepartment;
        break;
      default:
        currentData = null;
    }

  
    if (currentData?.data) {
      const labels = Object.keys(currentData.data);
      const series = Object.values(currentData.data);
      
      setPatientOptions(prevOptions => ({
        ...prevOptions,
        labels: labels
      }));
      
      setPatientData(series);
      setPeriodInfo(currentData.period);
    }
  }, [selectedCategory, weeklyPatientPerDepartment, monthlyPatientPerDepartment, quarterlyPatientPerDepartment, yearlyPatientPerDepartment, customPatientPerDepartment]);

  const handleCategoryChange = async (value) => {
    setSelectedCategory(value);

    switch(value) {
      case "week":
        await getWeeklyPatientPerDepartmentCount();
        break;
      case "month":
        await getMonthlyPatientPerDepartmentCount();
        break;
      case "quarter":
        await getQuarterlyPatientPerDepartmentCount();
        break;
      case "year":
        await getYearlyPatientPerDepartmentCount();
        break;
      default:
        break;
    }
  };

  const handleCustomDateApply = async () => {
    if (customStart && customEnd) {
      await getCustomPatientPerDepartmentCount(customStart, customEnd);
    }
  };

  const totalPatients = patientData.reduce((acc, val) => acc + val, 0);

  const getPeriodDisplay = () => {
    if (!periodInfo) return '';
    
    switch(periodInfo.type) {
      case "week":
        return `Week: ${periodInfo.range}`;
      case "month":
        return periodInfo.month;
      case "quarter":
        return `${periodInfo.quarter} (${periodInfo.range})`;
      case "year":
        return `Year ${periodInfo.year}`;
      case "custom":
        return periodInfo.range || '';
      default:
        return '';
    }
  };

  return (
    <div className='w-full h-full flex flex-col min-h-0'>
      <div className='w-full h-full flex flex-col min-h-0'>
        {/* Header */}
        <div className='shrink-0 flex items-start justify-between gap-2 pb-2'>
          <div className='text-sm font-semibold tracking-tight text-gray-800 dark:text-slate-100'>Patient Records Per Department</div>
          <div className='flex gap-1'>
            {['week', 'month', 'quarter', 'year'].map((val) => (
              <button
                key={val}
                onClick={() => handleCategoryChange(val)}
                className={`h-7 min-w-7 inline-flex items-center justify-center text-[10px] font-semibold rounded-md border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 ${
                  selectedCategory === val
                    ? 'bg-crimson-600 dark:bg-white dark:text-[#0C111D] border-crimson-600 dark:border-[#333741] text-white shadow-sm'
                    : 'bg-gray-100/80 dark:bg-[#1F242F]/70 border-gray-200 dark:border-[#333741] text-gray-500 dark:text-[#CECFD2] hover:bg-gray-200/80 dark:hover:bg-[#293040]'
                }`}
              >
                {val === 'week' ? 'W' : val === 'month' ? 'M' : val === 'quarter' ? 'Q' : 'Y'}
              </button>
            ))}
          </div>
        </div>

        {/* Period info */}
        {periodInfo && (
          <div className='shrink-0 text-xs font-semibold tracking-wide text-gray-400 dark:text-[#94969C] pb-2'>
            <p>{getPeriodDisplay()}</p>
          </div>
        )}

        {/* Chart */}
        <div className='flex-1 min-h-0'>
          {!periodInfo && patientData.length === 0 ? (
            <div className='w-full h-full flex items-center justify-center animate-pulse'>
              <div className='w-40 h-40 rounded-full bg-gray-200 dark:bg-[#1F242F] flex items-center justify-center'>
                <div className='w-24 h-24 rounded-full bg-white dark:bg-[#161B26]' />
              </div>
            </div>
          ) : totalPatients === 0 ? (
            <div className='w-full h-full flex items-center justify-center'>
              <p className='text-sm text-gray-400 dark:text-[#94969C]'>No patient records for this period</p>
            </div>
          ) : (
            <Chart
              options={patientOptions}
              series={patientData}
              type='donut'
              height="100%"
              width="100%"
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(PatientsPerDepartmentChart)
