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
    <div className='w-full h-full'>
          <div className='w-full h-full'>
            <div className='h-[10%] w-full flex justify-between p-2'>
              <div className='text-[.9rem] w-[70%] font-semibold'>Patient Records Per Department</div>
              <div className='text-[.9rem] h-[60%] w-[30%] '>
                <select
                  id='departments'
                  name='departments'
                  aria-label='Departments timeframe'
                  value={selectedCategory}
                  className='h-[95%] w-[98%] text-[.7rem] font-medium' 
                  onChange={handleCategoryChange}>
                  <option value='week'>This week</option>
                  <option value='month'>This month</option>
                  <option value='quarter'>This quarter</option>
                  <option value='year'>This year</option>
                </select>
              </div>
           </div>  

            <div className='h-[10%] w-full  text-[.7rem] font-medium'>
               {periodInfo && (
                <div className='w-full'>
                  <p>{getPeriodDisplay()}</p>
                </div>
              )}
            </div>

            <div className='h-[80%] w-full '>
              {totalPatients === 0 ? (
            <div className='w-full h-full flex items-center justify-center'>
              <p className='text-gray-500'>No patient records for this period</p>
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