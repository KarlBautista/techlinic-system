import React from 'react'
import Google from"../assets/image/google.png"
import TUP from "../assets/image/tup.png"
import "../App.css"
import { useState, useRef} from "react";
import useAuth from "../store/useAuthStore"

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signInWithGoogle, authenticatedUser } = useAuth();

  const handleSignInWithGoogle = async () => {
    try{
      const response = await signInWithGoogle();
      if(response.error){
        alert(`Error signing in with google: ${response.error}`);
        return;
      }
      if(response.data){
        alert("Success signing it with google");
        console.log(authenticatedUser);
      }
    } catch(err){
      console.error(err);
    }
  }
    
  return (
    <div className='fullScreen min-w-[640px]'>
    <form action="" className='form gap-5'>

        <div className='logoDiv'>
            <div className='logo'>
              <img src={TUP} alt="TUP" className='h-full' />
            </div>
            <div className='rightLogo flex flex-col justify-center '>
              <div>
                  <p className='tracking-[10px] text-[2rem] text-[#FF3A3A] font-bold'> TechClinic</p>
              </div>
              <div className='text-[#A12217]'>
                <p>Secure Electronic Medical Record</p>
              </div>
            </div>
        </div>


        <div className='formDiv'>
            <input
              type="text"
              id="email"
              name="email"
              placeholder=" "
            />
            <label htmlFor="email">Email</label>
        </div>

        <div className='formDiv'>
            <input
              type="text"
              id="email"
              name="password"
              placeholder=" "
            />
            <label htmlFor="password">Password</label>
        </div>

        <button className='tracking-[5px] bg-[#B22222] w-[40%] py-[10px] text-white rounded-lg'>LOGIN</button>

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

export default Login
