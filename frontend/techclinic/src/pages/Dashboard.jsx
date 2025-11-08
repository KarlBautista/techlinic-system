import React, { useEffect, useRef } from 'react'
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
const Dashboard = () => {

  return (
    <div className='flex h-full w-full gap-2'>
      <Navigation />
      <div className='p-5'>
        Dashboard
      </div>
    </div>

  )
}

export default Dashboard
