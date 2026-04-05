import React, { useEffect, useState } from 'react';
import Chart from "react-apexcharts";
import useChart from '../store/useChartStore';
import ChartPeriodSelector from '../components/ChartPeriodSelector';

const TopDiagnosisChart = () => {
  const {
    getWeeklyTopDiagnoses,
    getMonthlyTopDiagnoses,
    getQuarterlyTopDiagnoses,
    getYearlyTopDiagnoses,
    getCustomTopDiagnoses,
    weeklyTopDiagnoses,
    monthlyTopDiagnoses,
    quarterlyTopDiagnoses,
    yearlyTopDiagnoses,
    customTopDiagnoses
  } = useChart();

  const [selectedCategory, setSelectedCategory] = useState("week");
  const [chartData, setChartData] = useState(null);
  const [periodInfo, setPeriodInfo] = useState(null);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  
  const [chartOptions, setChartOptions] = useState({
    chart: {
      id: "top-diagnosis",
      toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } },
    },
    colors: ["#6366f1"],
    fill: {
      type: 'gradient',
      gradient: { shade: 'light', type: 'horizontal', shadeIntensity: 0.2, opacityFrom: 1, opacityTo: 0.85, stops: [0, 100] }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: '55%',
      }
    },
    xaxis: {
      categories: [],
      title: { text: "Number of Patients", style: { color: '#94969C', fontSize: '11px' } },
      labels: {
        formatter: function(val) {
          return Math.round(val);
        },
        style: { colors: '#94969C', fontSize: '11px' }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          colors: '#94969C',
          fontWeight: 500
        },
        maxWidth: 180
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return Math.round(val);
      },
      style: {
        fontSize: '11px',
        fontWeight: 600,
        colors: ['#fff']
      },
      dropShadow: { enabled: false }
    },
    grid: {
      borderColor: '#f3f4f6',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } }
    },
    tooltip: {
      theme: 'light',
      style: { fontSize: '12px' },
      y: {
        formatter: function(val) {
          return val + " patients";
        }
      }
    }
  });

  useEffect(() => {
    getWeeklyTopDiagnoses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      case "custom":
        currentData = customTopDiagnoses;
        break;
      default:
        currentData = null;
    }

    if (currentData) {
      setChartData(currentData);
      setPeriodInfo(currentData.period);

      setChartOptions(prev => ({
        ...prev,
        xaxis: {
          ...prev.xaxis,
          categories: currentData.topDiagnosesNames || []
        }
      }));
    }
  }, [selectedCategory, weeklyTopDiagnoses, monthlyTopDiagnoses, quarterlyTopDiagnoses, yearlyTopDiagnoses, customTopDiagnoses]);

  const handleCategoryChange = async (value) => {
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

  const handleCustomDateApply = async () => {
    if (customStart && customEnd) {
      await getCustomTopDiagnoses(customStart, customEnd);
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
      case "custom":
        return periodInfo.range || '';
      default:
        return '';
    }
  };

  const series = chartData ? [
    {
      name: "Patients",
      data: chartData.topDiagnosesCount || []
    }
  ] : [];

  const hasData = chartData && chartData.topDiagnosesCount && chartData.topDiagnosesCount.length > 0;

  return (
    <div className='w-full h-full flex flex-col min-h-0'>
      {/* Header */}
      <div className='shrink-0 flex items-start justify-between gap-2 pb-2'>
        <div className='text-sm font-semibold tracking-tight text-gray-800 dark:text-slate-100'>Top Diagnoses</div>
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

      {/* Period info */}
      {periodInfo && (
        <div className='shrink-0 text-xs font-semibold tracking-wide text-gray-400 dark:text-[#94969C] pb-2'>
          <p>{getPeriodDisplay()}</p>
        </div>
      )}

      {/* Chart */}
      <div className='flex-1 min-h-0'>
        {!chartData ? (
          <div className='w-full h-full animate-pulse flex flex-col gap-3 justify-center px-4'>
            {[75, 60, 45, 35, 25].map((w, i) => (
              <div key={i} className='flex items-center gap-3'>
                <div className='h-3 w-20 bg-gray-100 dark:bg-[#1F242F] rounded shrink-0' />
                <div className='h-6 bg-gray-200 dark:bg-[#1F242F] rounded' style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        ) : !hasData ? (
          <div className='w-full h-full flex items-center justify-center'>
            <p className='text-sm text-gray-400 dark:text-[#94969C]'>No diagnosis data available for this period</p>
          </div>
        ) : (
          <Chart
            options={chartOptions}
            series={series}
            type="bar"
            height="100%"
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(TopDiagnosisChart);
