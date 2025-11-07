import React from 'react'
import Google from"../assets/image/google.png"
import TUP from "../assets/image/tup.png"
import "../App.css"
import { useState, useRef} from "react";

const Login = () => {
    
  return (
    <div className='fullScreen min-w-[640px]'>
    
    <form action="" className='form gap-5'>
        <div className='formDiv'>
            <input
              type="text"
              id="email"
              name="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="email">Email</label>
        </div>

        <div className='formDiv'>
            <input
              type="text"
              id="email"
              name="password"
              value={password}
              placeholder=" "
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="password">Password</label>
        </div>

        <button className='tracking-[5px] bg-[#B22222] w-[40%] py-[10px] text-white rounded-lg sm:bg-black md:bg-blue-100'>LOGIN</button>

        <div className='h-[30px] w-[40%]  flex items-center justify-center'>
          <div className='w-[35%] border-1 border-gray-300'></div>
          <p className='w-[30%] flex items-center justify-center'>or login with</p>
          <div className='w-[35%] border-1 border-gray-300'></div>
        </div>

        <div className= 'h-[70px] w-[40%] flex items-center justify-evenly'>
          <button className='h-[60px] w-[60px] bg-gray-100 rounded-full'
          onClick={() => handleSignInWithGoogle()}>
                <img src={Google} alt="Google" />
            </button>
        </div>

    </form>


    <div className='h-full w-[40%] bg-[#62b6cb]'> 

    </div>

    </div>
  )
}

export default Register
