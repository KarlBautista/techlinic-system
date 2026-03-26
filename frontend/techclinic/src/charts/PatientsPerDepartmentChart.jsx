import React, { useEffect, useState } from 'react'
import Chart from "react-apexcharts"
import useChart from '../store/useChartStore';

const PatientsPerDepartmentChart = () => {
  const { 
    getWeeklyPatientPerDepartmentCount, 
    getMonthlyPatientPerDepartmentCount, 
    getQuarterlyPatientPerDepartmentCount, 
    getYearlyPatientPerDepartmentCount,
    weeklyPatientPerDepartment, 
    monthlyPatientPerDepartment,
    quarterlyPatientPerDepartment, 
    yearlyPatientPerDepartment 
  } = useChart();
  
  const [selectedCategory, setSelectedCategory] = useState("week");
  const [patientData, setPatientData] = useState([]);
  const [periodInfo, setPeriodInfo] = useState(null);
  const [patientOptions, setPatientOptions] = useState({
    chart: {
      type: "donut",
      size: "100%",
      id: "patient-per-department",
      toolbar: { show: true },
      dropShadow: { enabled: true, top: 2, left: 0, blur: 6, opacity: 0.12 }
    },
    labels: [],
    colors: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'],
    stroke: { width: 2, colors: ['#fff'] },
    title: {
      text: 'Number of Patient Records per Department',
      align: 'left',
      style: {
        fontSize: '12px',  
        fontWeight: 'normal',
        color: '#6b7280'
      }
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      fontWeight: 500,
      markers: { width: 10, height: 10, radius: 3 },
      itemMargin: { horizontal: 8, vertical: 4 }
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
          size: '58%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Patients',
              fontSize: '13px',
              fontWeight: 600,
              color: '#374151',
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
  }, [selectedCategory, weeklyPatientPerDepartment, monthlyPatientPerDepartment, quarterlyPatientPerDepartment, yearlyPatientPerDepartment]);

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
      default:
        return '';
    }
  };

  return (
    <div className='w-full h-full flex flex-col min-h-0'>
          <div className='w-full h-full flex flex-col min-h-0'>
            {/* Header */}
            <div className='shrink-0 flex items-start justify-between gap-2 pb-2'>
              <div className='text-sm font-semibold text-gray-800'>Patient Records Per Department</div>
              <div className='flex gap-1'>
                {['week', 'month', 'quarter', 'year'].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleCategoryChange(val)}
                    className={`text-[10px] font-medium px-2.5 py-1 rounded-lg transition-all duration-200 ${
                      selectedCategory === val
                        ? 'bg-crimson-600 text-white shadow-sm'
                        : 'bg-gray-100/80 text-gray-500 hover:bg-gray-200/80'
                    }`}
                  >
                    {val === 'week' ? 'W' : val === 'month' ? 'M' : val === 'quarter' ? 'Q' : 'Y'}
                  </button>
                ))}
              </div>
            </div>

            {/* Period info */}
            {periodInfo && (
              <div className='shrink-0 text-xs font-medium text-gray-400 pb-2'>
                <p>{getPeriodDisplay()}</p>
              </div>
            )}

            {/* Chart */}
            <div className='flex-1 min-h-0'>
              {!periodInfo && patientData.length === 0 ? (
                <div className='w-full h-full flex items-center justify-center animate-pulse'>
                  <div className='w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center'>
                    <div className='w-24 h-24 rounded-full bg-white' />
                  </div>
                </div>
              ) : totalPatients === 0 ? (
                <div className='w-full h-full flex items-center justify-center'>
                  <p className='text-sm text-gray-400'>No patient records for this period</p>
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