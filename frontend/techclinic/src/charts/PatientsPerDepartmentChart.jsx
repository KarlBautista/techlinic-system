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
    },
    labels: [],
    title: {
      text: 'Number of Patient Records per Department',
      align: 'left',
      style: {
        fontSize: '12px',  
        fontWeight: 'normal'
  }
    },
    legend: {
      position: 'bottom'
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        return opts.w.config.series[opts.seriesIndex];
      }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Patients',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              }
            }
          }
        }
      }
    },
    tooltip: {
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

  const handleCategoryChange = async (e) => {
    const value = e.target.value;
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
              <select
                  id='departments'
                  name='departments'
                  aria-label='Departments timeframe'
                  value={selectedCategory}
                  className='shrink-0 text-xs font-medium px-2 py-1 rounded-lg ring-1 ring-gray-200 outline-none bg-white text-gray-600 focus:ring-crimson-400' 
                  onChange={handleCategoryChange}>
                  <option value='week'>This week</option>
                  <option value='month'>This month</option>
                  <option value='quarter'>This quarter</option>
                  <option value='year'>This year</option>
              </select>
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