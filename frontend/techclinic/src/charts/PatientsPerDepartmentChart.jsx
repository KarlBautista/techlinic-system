import React from 'react'
import Chart from "react-apexcharts"
const PatientsPerDepartmentChart = () => {
   
  const patientsPerDepartmentOptions = {
    chart: {
      type: "donut",
      size: "100%",
      id: "student-per-department",
      toolbar: { show: false },
    },
    labels: [
      'College of Engineering',
      'College of Industrial Technology',
      'College of Industrial Education',
      'College of Architecture & Fine Arts',
      'College of Science',
      'College of Liberal Arts'
    ],
    title: {
      text: 'Number of Students per Department',
      align: 'center'
    },
     legend: {
      position: 'bottom'
    },
  };

   const patientsPerDepartmentData = [100, 56, 150, 60, 20, 30];
  

  return (
     <div className='w-full shadow-md rounded-lg border border-gray-200 p-5'>
                <div className='w-full flex items-center justify-between mb-3'>
                  <h3 className='text-2xl font-semibold '>Students Per Department</h3>
                  <div className='group inline-block'>
                    <select
                      id='departments'
                      name='departments'
                      aria-label='Departments timeframe'
                      className='appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-md pl-3 pr-3 py-1.5 focus:outline-none transition-colors duration-150 ease-in-out'>
                        <option value='week'>This week</option>
                        <option value='month'>This month</option>
                        <option value='quarter'>This quarter</option>
                        <option value='year'>This year</option>
                    </select>
                  </div>
                </div>
                <div className='w-full h-96 md:h-80'>
                  <Chart
                    options={patientsPerDepartmentOptions}
                    series={patientsPerDepartmentData}
                    type='donut'
                    height="100%"
                    width="100%"
                  />
                </div>
              </div>
  )
}

export default PatientsPerDepartmentChart
