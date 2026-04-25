import React, { useEffect, useMemo, useState } from 'react'
import Chart from "react-apexcharts"
import useChart from '../store/useChartStore';
import useData from '../store/useDataStore';
import ChartPeriodSelector from '../components/ChartPeriodSelector';

const PatientsPerDepartmentChart = ({ onInsightChange }) => {
  const { patientRecords } = useData();
  const records = useMemo(() => patientRecords?.data || [], [patientRecords]);

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
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [patientOptions, setPatientOptions] = useState({
    chart: {
      type: "donut",
      size: "100%",
      id: "patient-per-department",
      toolbar: { show: true, tools: { download: true, selection: false, zoom: false, zoomin: false, zoomout: false, pan: false, reset: false } },
      events: {
        dataPointSelection: (_event, _chartContext, config) => {
          const label = config?.w?.config?.labels?.[config?.dataPointIndex];
          if (label) setSelectedDepartment(label);
        }
      },
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const isInSelectedPeriod = (dateValue) => {
    if (!dateValue) return false;

    const date = new Date(dateValue);
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    if (selectedCategory === "custom") {
      if (!customStart || !customEnd) return false;
      const customStartDate = new Date(customStart);
      const customEndDate = new Date(customEnd);
      customStartDate.setHours(0, 0, 0, 0);
      customEndDate.setHours(23, 59, 59, 999);
      return date >= customStartDate && date <= customEndDate;
    }

    if (selectedCategory === "week") {
      const day = now.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      start.setDate(now.getDate() + diffToMonday);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    }

    if (selectedCategory === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(now.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }

    if (selectedCategory === "quarter") {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      start.setMonth(quarterStartMonth, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(quarterStartMonth + 3, 0);
      end.setHours(23, 59, 59, 999);
    }

    if (selectedCategory === "year") {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
    }

    return date >= start && date <= end;
  };

  const departmentDiseaseReports = useMemo(() => {
    const departments = patientOptions?.labels || [];

    return departments.map((department) => {
      const scopedRecords = records.filter((record) => (
        record.department === department && isInSelectedPeriod(record.created_at)
      ));

      const diagnosisCount = {};
      let totalDiagnosedCases = 0;

      scopedRecords.forEach((record) => {
        const diagnoses = Array.isArray(record.diagnoses) ? record.diagnoses : [];
        diagnoses.forEach((item) => {
          const diagnosisName = (item?.diagnosis || "Unknown").trim() || "Unknown";
          diagnosisCount[diagnosisName] = (diagnosisCount[diagnosisName] || 0) + 1;
          totalDiagnosedCases += 1;
        });
      });

      const topDiseases = Object.entries(diagnosisCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, count }));

      return {
        department,
        totalVisits: scopedRecords.length,
        totalDiagnosedCases,
        topDiseases,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientOptions?.labels, records, selectedCategory, customStart, customEnd, periodInfo]);

  const selectedDepartmentReport = useMemo(() => {
    if (!selectedDepartment) return null;
    return departmentDiseaseReports.find((item) => item.department === selectedDepartment) || null;
  }, [departmentDiseaseReports, selectedDepartment]);

  useEffect(() => {
    const labels = patientOptions?.labels || [];
    const hasDepartment = labels.includes(selectedDepartment);
    if (selectedDepartment && labels.length > 0 && !hasDepartment) {
      setSelectedDepartment("");
    }
  }, [patientOptions, selectedDepartment]);

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

  useEffect(() => {
    if (typeof onInsightChange !== "function") return;

    onInsightChange({
      title: "Patient Records Per College",
      periodText: getPeriodDisplay(),
      labels: patientOptions?.labels || [],
      values: patientData,
      selectedDepartmentReport,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onInsightChange, patientData, patientOptions, periodInfo, selectedDepartmentReport]);

  return (
    <div className='w-full h-full flex flex-col min-h-0'>
      <div className='w-full h-full flex flex-col min-h-0'>
        {/* Header */}
        <div className='shrink-0 flex items-start justify-between gap-2 pb-2'>
          <div className='text-sm font-semibold tracking-tight text-gray-800 dark:text-slate-100'>Patient Records Per College</div>
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
            <p className='mt-1 text-[10px] text-gray-400 dark:text-gray-500'>Click a college slice to show disease report in the Data panel.</p>
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
