import React, { useEffect, useState } from 'react';
import Chart from "react-apexcharts";
import useChart from '../store/useChartStore';

const TopDiagnosisChart = () => {
  const {
    getWeeklyTopDiagnoses,
    getMonthlyTopDiagnoses,
    getQuarterlyTopDiagnoses,
    getYearlyTopDiagnoses,
    weeklyTopDiagnoses,
    monthlyTopDiagnoses,
    quarterlyTopDiagnoses,
    yearlyTopDiagnoses
  } = useChart();

  const [selectedCategory, setSelectedCategory] = useState("week");
  const [chartData, setChartData] = useState(null);
  const [periodInfo, setPeriodInfo] = useState(null);
  
  const [paretoOptions, setParetoOptions] = useState({
    chart: {
      id: "top-diagnosis-pareto",
      toolbar: { show: true },
      stacked: false,
    },
    colors: ["#3b82f6", "#ef4444"],
    stroke: {
      width: [0, 3],
      curve: "smooth"
    },
    plotOptions: {
      bar: {
        columnWidth: "50%"
      }
    },
    title: {
      text: "Top Diagnoses (Pareto Chart)",
      align: "center",
      style: { fontSize: "18px", fontWeight: "bold" }
    },
    xaxis: {
      categories: [],
      title: { text: "Diagnosis" }
    },
    yaxis: [
      {
        title: { text: "Number of Patients" },
        labels: {
          formatter: function(val) {
            return Math.round(val);
          }
        }
      },
      {
        opposite: true,
        title: { text: "Cumulative %" },
        min: 0,
        max: 100,
        labels: {
          formatter: function(val) {
            return val.toFixed(0) + "%";
          }
        }
      }
    ],
    dataLabels: {
      enabled: true,
      enabledOnSeries: [0],
      formatter: function(val) {
        return Math.round(val);
      }
    },
    legend: {
      position: 'top'
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function(val, opts) {
          if (opts.seriesIndex === 1) {
            return val.toFixed(1) + "%";
          }
          return val + " patients";
        }
      }
    }
  });

  const [trendOptions, setTrendOptions] = useState({
    chart: {
      id: "diagnosis-trend",
      toolbar: { show: true },
      type: 'line'
    },
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    title: {
      text: "Top Diagnoses Trend",
      align: "center",
      style: { fontSize: "18px", fontWeight: "bold" }
    },
    xaxis: {
      categories: [],
    },
    yaxis: {
      title: { text: "Number of Cases" },
      labels: {
        formatter: function(val) {
          return Math.round(val);
        }
      }
    },
    legend: {
      position: 'top'
    },
    tooltip: {
      shared: true,
      intersect: false
    }
  });

  useEffect(() => {
    getWeeklyTopDiagnoses();
  }, []);

  useEffect(() => {
    let currentData = null;

    switch(selectedCategory) {
      case "week":
        currentData = weeklyTopDiagnoses;
        break;
      case "month":
        currentData = monthlyTopDiagnoses;
        break;
      case "quarter":
        currentData = quarterlyTopDiagnoses;
        break;
      case "year":
        currentData = yearlyTopDiagnoses;
        break;
      default:
        currentData = null;
    }

    if (currentData) {
      setChartData(currentData);
      setPeriodInfo(currentData.period);

      // Update Pareto chart options
      setParetoOptions(prev => ({
        ...prev,
        xaxis: {
          ...prev.xaxis,
          categories: currentData.topDiagnosesNames || []
        }
      }));

      // Update Trend chart options
      setTrendOptions(prev => ({
        ...prev,
        xaxis: {
          ...prev.xaxis,
          categories: currentData.labels || []
        }
      }));
    }
  }, [selectedCategory, weeklyTopDiagnoses, monthlyTopDiagnoses, quarterlyTopDiagnoses, yearlyTopDiagnoses]);

  const handleCategoryChange = async (e) => {
    const value = e.target.value;
    setSelectedCategory(value);

    switch(value) {
      case "week":
        await getWeeklyTopDiagnoses();
        break;
      case "month":
        await getMonthlyTopDiagnoses();
        break;
      case "quarter":
        await getQuarterlyTopDiagnoses();
        break;
      case "year":
        await getYearlyTopDiagnoses();
        break;
      default:
        break;
    }
  };

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

  const paretoSeries = chartData ? [
    {
      name: "Patient Count",
      type: "column",
      data: chartData.topDiagnosesCount || []
    },
    {
      name: "Cumulative %",
      type: "line",
      data: chartData.cumulativePercent || []
    }
  ] : [];

  const trendSeries = chartData?.series || [];

  const hasData = chartData && chartData.topDiagnosesCount && chartData.topDiagnosesCount.length > 0;

  return (
    <div className='w-full shadow-md rounded-lg border border-gray-200 p-5'>
      <div className='w-full flex flex-col gap-2 mb-3'>
        <div className='w-full flex items-center justify-between'>
          <h3 className='text-2xl font-semibold'>Top Diagnoses Analysis</h3>
          <div className='group inline-block'>
            <select
              id='diagnoses-timeframe'
              name='diagnoses-timeframe'
              aria-label='Diagnoses timeframe'
              value={selectedCategory}
              onChange={handleCategoryChange}
              className='appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150 ease-in-out cursor-pointer'>
              <option value='week'>This week</option>
              <option value='month'>This month</option>
              <option value='quarter'>This quarter</option>
              <option value='year'>This year</option>
            </select>
          </div>
        </div>
        {periodInfo && (
          <div className='w-full'>
            <p className='text-[17px] font-semibold px-5'>{getPeriodDisplay()}</p>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className='w-full h-96 flex items-center justify-center'>
          <p className='text-gray-500'>No diagnosis data available for this period</p>
        </div>
      ) : (
        <div className='w-full space-y-6'>
          {/* Pareto Chart - Shows top diagnoses with cumulative percentage */}
          <div className='w-full'>
            <Chart
              options={paretoOptions}
              series={paretoSeries}
              type="line"
              height={400}
            />
          </div>

          {/* Trend Chart - Shows how diagnoses trend over time periods */}
          <div className='w-full'>
            <Chart
              options={trendOptions}
              series={trendSeries}
              type="line"
              height={400}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TopDiagnosisChart;