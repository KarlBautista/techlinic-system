import React, { useEffect, useRef } from 'react'
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import useAuth from '../store/useAuthStore';

const Dashboard = () => {
  const { authenticatedUser } = useAuth();
  const date = new Date();
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

 
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

    
          
      </div>
    </div>

  )
}

export default Dashboard
