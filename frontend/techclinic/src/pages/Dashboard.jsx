import React, { useEffect, useRef } from 'react'
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import useAuth from '../store/useAuthStore';
import Chart from "react-apexcharts"
const Dashboard = () => {
  const { authenticatedUser } = useAuth();
  const date = new Date();
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  //Placeholder lang muna para sa charts natin to para may ui na
  const medicineChartOptions = {
    chart: {
      id: "medicine-chart",
      toolbar: { show: false }
    },
    xaxis: {
      categories: ["Paracetamol", "Amoxicillin", "Ibuprofen", "Metformin", "Loperamide"],
    },
      colors: ["#ef4444"],
    labels: { style: { colors: '#6b7280' } },
    title: {
        text: "Stock level (%)",
        style: { fontWeight: 'bold', color: '#6b7280' }
      },
     grid: {
          borderColor: '#e5e7eb'
    },
    title: {
        text: "Top Medicines By Stock Level",
        align: "left",
        style: { fontSize: "16px", fontWeight: "bold" }
    },
    dataLabels: {
      enabled: false
    },
  }

  const patientChartOptions = {
    chart: {
      id: "patients-chart",
      toolbar: { show: false }
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    colors: ["#ef4444"],
    stroke: {
      curve: "smooth"
    },
    dataLabels: {
      enabled: false
    },
    grid: {
      borderColor: "#e5e7eb"
    },
    title: {
      text: "Weekly Patient Count",
      align: "left",
      style: {
        fontSize: "16px",
        fontWeight: "bold"
      }
    }
  };

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
  
  const topDiagnoses = ["Flu", "Hypertension", "Diabetes", "COVID-19", "Asthma"];
  const patientsCount = [120, 95, 80, 60, 45]; // bar values
  const cumulativePercent = [30, 55, 75, 90, 100]; // line values (optional)

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


  const patientsData = [
    {
      name: "Patients",
      data: [10, 20, 15, 30, 25, 35, 40]
    }
  ];

  const medicineData = [{
    name: "Medicine",
    data: [75, 45, 30, 60, 25]
  }];

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


 const patientsPerDepartmentData = [100, 56, 150, 60, 20, 30];
  return (
    <div className='flex h-full w-full gap-2'>
      <div className='w-[17%] h-full'>
           <Navigation />
      </div>
      <div className='p-5 w-[83%] h-full flex flex-col gap-5'>
         <div className='w-full flex flex-col gap-2'>
          <h2 className='text-2xl font-semibold text-gray-900'>Good Day, Dr. {authenticatedUser?.user_metadata?.name}</h2>
          <h3 className='text-gray-500'>{formattedDate}</h3>
      </div>

      {/*ito para na sa tatlong box sa dashboard*/}
      <div className='w-full h-full flex flex-col gap-5'>
      <div className='w-full h-[40%] flex justify-between gap-5'>
        <div className='w-[33.33%] h-full shadow-md rounded-lg border border-gray-200 p-5'>
          <div className='w-full h-[20%] flex justify-between'>
              <h3 className='text-2xl font-semibold '>Patients</h3>
              <div className='group inline-block'>
                <select
                  id='patients'
                  name='patients'
                  aria-label='Patients timeframe'
                  className='appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-md pl-3 pr-3 py-1.5 focus:outline-none transition-colors 
                    duration-150 ease-in-out group-hover:border-red-500 group-hover:ring-2 group-hover:ring-red-200'>
                    <option value='week'>This week</option>
                    <option value='month'>This month</option>
                    <option value='quarter'>This quarter</option>
                    <option value='year'>This year</option>
                </select>
              </div>
          </div>
          {/*dito patients graph*/}
          <div className='w-full h-[80%]'>
              <div className='w-full h-[80%]'>
              <Chart
                options={patientChartOptions}
                series={patientsData}
                type="area"
                height="100%"
              />
          </div>
          </div>
        </div>

        {/* pangalawang box*/}
       <div className='w-[33.33%] h-full shadow-md rounded-lg border border-gray-200 p-5'>
          <div className='w-full h-[20%] flex justify-between'>
              <h3 className='text-2xl font-semibold '>Medicines</h3>
              <div className='group inline-block'>
                <select
                  id='patients'
                  name='patients'
                  aria-label='Patients timeframe'
                  className='appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-md pl-3 pr-3 py-1.5 focus:outline-none transition-colors 
                    duration-150 ease-in-out group-hover:border-red-500 group-hover:ring-2 group-hover:ring-red-200'>
                    <option value='week'>This week</option>
                    <option value='month'>This month</option>
                    <option value='quarter'>This quarter</option>
                    <option value='year'>This year</option>
                </select>
              </div>
          </div>
          {/*dito medicine graph*/}
          <div className='w-full h-[80%]'>
              <div className='w-full h-[80%]'>
              <Chart
                options={medicineChartOptions}
                series={medicineData}
                type="bar"
                height="100%"
              />
          </div>
          </div>
        </div>

        {/* pangatlong box*/}
        <div className='w-[33.33%] h-full shadow-md rounded-lg border border-gray-200 p-5'>
          <div className='w-full h-[20%] flex justify-between'>
              <h3 className='text-2xl font-semibold '>Students Per Department</h3>
              <div className='group inline-block'>
                <select
                  id='patients'
                  name='patients'
                  aria-label='Patients timeframe'
                  className='appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-md pl-3 pr-3 py-1.5 focus:outline-none transition-colors 
                    duration-150 ease-in-out group-hover:border-red-500 group-hover:ring-2 group-hover:ring-red-200'>
                    <option value='week'>This week</option>
                    <option value='month'>This month</option>
                    <option value='quarter'>This quarter</option>
                    <option value='year'>This year</option>
                </select>
              </div>
          </div>
          {/*dito patientPerDepartment graph*/}
          <div className='w-full h-[80%]'>
              <div className='w-full h-[80%]'>
              <Chart
                options={patientsPerDepartmentOptions}
                series={patientsPerDepartmentData}
                type='donut'
                height="100%"
                width="100%"
              />
          </div>
          </div>
        </div>
        {/*dito naman yung malaking graph*/}
       </div>
        <div className='w-full h-[58%] shadow-md rounded-lg border border-gray-200 p-5'>
          <div className='w-full h-[20%] flex justify-between'>
            <h3 className='text-2xl font-semibold '>Top Diagnosis</h3>
              <div className='group inline-block'>
                <select
                  id='patients'
                  name='patients'
                  aria-label='Patients timeframe'
                  className='appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-md pl-3 pr-3 py-1.5 focus:outline-none transition-colors 
                    duration-150 ease-in-out group-hover:border-red-500 group-hover:ring-2 group-hover:ring-red-200'>
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
                height="350px"
              />
          </div>
          </div>
        </div>

        {/* dito na susunod na mga ialalagay sa baba, naka flex col na to */}

      </div>
          
      </div>
    </div>

  )
}

export default Dashboard
