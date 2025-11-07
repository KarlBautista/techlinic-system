import React from 'react'
import "../App.css"
import { useState } from "react";
import useAuth from '../store/useAuthStore';
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); 
    const { signInWithGoogle, authenticatedUser } = useAuth();
    console.log(authenticatedUser);
    const handleSignInWithGoogle = async (e) => {
      try{
        const response = await signInWithGoogle();
        if(response.error){
          console.error(`Error Signing up: ${response.error}`);
          alert("Error signing up: ", response.error);
        }
      } catch (err){
        console.error(err.message);
      }
      
    }
    const handleSignin = () => {

    }
  return (
    <div className='fullScreen'>

    <form onSubmit={handleSignin} className='form gap-5'>
        <div className='formDiv'>
            <input
              type="text"
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
              name="password"
              value={password}
              placeholder=" "
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="password">Password</label>
        </div>

        <button className='tracking-[5px] bg-[#B22222] w-[40%] py-[10px] text-white rounded-lg sm:bg-black md:bg-blue-100'
        >LOGIN</button>

        <div className='h-[30px] w-[40%]  flex items-center justify-center'>
          <div className='w-[35%] border-1 border-gray-300'></div>
          <p className='w-[30%] flex items-center justify-center'>or login with</p>
          <div className='w-[35%] border-1 border-gray-300'></div>
        </div>


    </form>
    
        <div className='bg-red-100 h-[70px] w-[40%] flex items-center justify-evenly'
        onClick={() => handleSignInWithGoogle()}>
            <button className='h-[60px] w-[60px] bg-blue-100 rounded-full'>
                <img src="" alt="Google" />
            </button>

        </div>
    <div className='h-full w-[40%] bg-[#62b6cb]'> 

    </div>

    </div>
  )
}

export default Login
