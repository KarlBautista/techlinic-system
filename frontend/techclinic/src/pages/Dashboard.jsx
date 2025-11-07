import React, { useEffect, useRef } from 'react'
import useAuth from '../store/useAuthStore'
import Swal from "sweetalert2";
import TUP from "../assets/image/TUP.png"
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { signOut, authenticatedUser } = useAuth();
  const navigate = useNavigate();
  const mynavigation = useRef(null)

    const handleMe = () => {
      const el = mynavigation.current;
      el.classList.toggle('shownNav');
    }
  return (
    <div className='flex gap2 hfull'>
      <div  ref={mynavigation}>
        <button onClick={handleMe} className='h[20px] w[20px]'>click me</button>
      </div>
      <div className='w-[70%] bg-pink-100'></div>
    </div>
  )
}

export default Dashboard
