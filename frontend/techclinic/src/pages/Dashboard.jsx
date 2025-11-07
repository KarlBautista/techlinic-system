import React, { useEffect } from 'react'
import useAuth from '../store/useAuthStore'
import Swal from "sweetalert2";
import TUP from "../assets/image/TUP.png"
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
  const { signOut, authenticatedUser } = useAuth();
  const navigate = useNavigate();
  console.log(authenticatedUser);
    if(authenticatedUser){
        Swal.fire({
            icon: "success",
            imageUrl: authenticatedUser?.user_metadata.avatar_url,
            imageHeight: "150px",
            imageWidth: "150px",
            title: `Welcome to Techclinic, ${authenticatedUser.user_metadata.name}`,
            showConfirmButton: false,
            timer: 2000
          });
    }
 

  const handleSignOut = async () => {
    try{
    
        const response = await signOut();
        if(response.error){
               
            alert(response.error);
            return;
        }
        Swal.fire({
            icon: "success",
            imageUrl: TUP,
            imageHeight: "150px",
            imageWidth: "150px",
            title: "Signed-out",
            text: "Thank you for using Techclinic.",    
          });
           
        navigate("/");
    } catch (err){
        console.error(err.message);
    }
 
  }
  return (
    <div>
      Ito nasa DASHBOARD KA NA
      <button onClick={() => handleSignOut()} className='bg-red-500 p-5 text-white'>Sign out</button>
      <img src={authenticatedUser.user_metadata.avatar_url} alt="" className='w-[50px] h-[50px] rounded-full'/>
      <div>{authenticatedUser.user_metadata.name}</div>
      <div>{authenticatedUser.user_metadata.email}</div>
    </div>
  )
}

export default Dashboard
