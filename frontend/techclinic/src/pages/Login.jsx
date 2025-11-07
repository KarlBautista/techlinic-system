import React from 'react'
import "../App.css"
import { useState } from "react";
import useAuth from '../store/useAuthStore';
import TUP from "../assets/image/TUP.png"
import Google from "../assets/image/google.png"
import School from "../assets/image/school.jpg"

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
    <div className='fullScreen min-w-[640px]'>


      <div className='flex flex-col h-full gap-10 sm:w-full min-w-[640px] lg:w-[60%]'>
        <form onSubmit={handleSignin} className='form gap-4'>


          <div className='logoDiv'> 
            <div className="logo justify-center items-center flex">
              <img src={TUP} alt="TUP" className='h-[80%]'/>
            </div>
            <div className="rightLogo">
              <p className='text-[#FF3A3A] text-[2.5rem] tracking-[10px] font-bold lg:text-[1.6rem] xl:text-[2.5rem]'>Techclinic</p>
              <p className='text-[#A12217] lg:text-[.8rem]'>Health Record and Analytics System</p>
            </div>
          </div>


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



            <button className='tracking-[5px] bg-[#B22222] w-[60%] py-[10px] text-white rounded-lg lg:w-[50%]' type="submit"
            >LOGIN</button>

            <div className='h-[30px] w-[60%]  flex items-center justify-center lg:w-[50%]'>
              <div className='w-[35%] border-1 border-gray-300'></div>
              <p className='w-[30%] flex items-center justify-center'>or login with</p>
              <div className='w-[35%] border-1 border-gray-300'></div>
            </div>
        </form>



















        <div className='h-[30%] w-full flex items-start justify-center'>

                    <div className='h-[70px] w-[40%] flex items-center justify-evenly'
        onClick={() => handleSignInWithGoogle()}>
            <button className='h-[60px] w-[60px] rounded-full bg-gray-100'>
                <img src={Google} alt="Google" />
            </button>

        </div>
          
        </div>

      </div>

    <div className='hidden lg:block lg:w-[40%] h-full lg:bg-black'> 

    </div>

    </div>
  )
}

export default Login
