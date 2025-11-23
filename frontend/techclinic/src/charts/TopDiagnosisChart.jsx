import React from 'react'
import Chart from "react-apexcharts"
const TopDiagnosisChart = () => {

const patientsCount = [120, 95, 80, 60, 45]; // bar values
  const topDiagnoses = ["Flu", "Hypertension", "Diabetes", "COVID-19", "Asthma"];
  const topDiagnosisOptions = {
    chart: {
      id: "top-diagnosis",
      toolbar: { show: false },
    },
    colors: ["#ef4444"],
    stroke: {
      curve: "smooth"
    },
    title: {
      text: "Top Diagnoses",
      align: "center",
      style: { fontSize: "16px", fontWeight: "bold" }
    },
    xaxis: {
      categories: topDiagnoses,
    },
    yaxis: [
      {
        title: { text: "Number of Patients" },
      },
      {
        opposite: true,
        title: { text: "Cumulative %" },
        max: 100
      }
    ],
    dataLabels: {
      enabled: true,
      enabledOnSeries: [0], // show labels only on bars
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
  };

const cumulativePercent = [30, 55, 75, 90, 100]; // line values (optional)
  const topDiagnosisSeries = [
    {
      name: "Patients",
      type: "column",  // bar chart
      data: patientsCount
    },
    {
      name: "Cumulative %",
      type: "line",    // line chart
      data: cumulativePercent
    }
];



  return (
     <div className='w-full h-full shadow-md rounded-lg border border-gray-200 px-5 py-20'>
          <div className='w-full h-[20%] flex justify-between'>
            <h3 className='text-2xl font-semibold '>Top Diagnosis</h3>
              <div className='group inline-block'>
                <select
                  id='patients'
                  name='patients'
                  aria-label='Patients timeframe'
                  className='appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-md pl-3 pr-3 py-1.5 focus:outline-none transition-colors duration-150 ease-in-out'>
                    <option value='week'>This week</option>
                    <option value='month'>This month</option>
                    <option value='quarter'>This quarter</option>
                    <option value='year'>This year</option>
                </select>
              </div>
          </div>
          <div className='w-full h-[80%]'>
            <div className='w-full h-[80%]'>
              <Chart
                options={topDiagnosisOptions}
                series={topDiagnosisSeries}
                type="line"
                height={500}
              />
            </div>
          </div>
        </div>
  )
}

export default TopDiagnosisChart
