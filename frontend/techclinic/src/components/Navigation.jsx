import React from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import TUP from "../assets/image/TUP.png"
import Logout from "../assets/image/logout.png"
import useAuth from '../store/useAuthStore'
import Swal from 'sweetalert2'
import Mysettings from '../assets/image/settings.svg'

const Navigation = () => {
    const { authenticatedUser, signOut } = useAuth();
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();
    const handleSignOut = async () => {
        try{
            const response = await signOut();
            if(response.error){
                Swal.fire({
                    title: "Something went wrong. Can't sign-out.",
                    imageUrl: TUP,
                    imageHeight: "150px",
                    imageWidth: "150px",
                    text: "Please try again"
                });
                return;
            }
                Swal.fire({
                    title: "Signing Out",
                    imageUrl: TUP,
                    imageHeight: "150px",
                    imageWidth: "150px",
                    text: "Thank you for choosing Techclinic.",
                });
                navigate("/");
        } catch (err){
            console.error(err);
        }
    }
    return (
        <div className='nav'>
            <div className='h-[10%] w-full border-b border-gray-300 flex items-center justify-center'>
                <div className='w-[90%] h-[80%] flex gap-2'>
                    <div className='w-[30%] h-full flex items-center justify-center'>
                        <img src={TUP} alt="TUP" className='h-full  object-contain'/>
                    </div>
                    <div className='h-full w-[70%] flex flex-col justify-center'>
                            <p className='xl:text-[1.2rem] text-[#A12217] font-bold md:text-[1rem]'>TechClinic</p>
                            <p className='xl:text-[.7rem] text-[#A12217] md:text-[.5rem] sm:text-[.7rem]'>Electronic Medical Record</p>
                    </div>
                </div>
            </div>
             
    <div className='h-[70%] w-full flex flex-col items-center justify-center text-[0.9rem] gap-3'>
            <Link to={'/dashboard'} className={`${currentPath === '/dashboard' ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217]' : 'bg-transparent'} w-full py-3 flex items-center justify-center  `}>Dashboard</Link>
            <Link to={'/new-patient'} className={`${currentPath === '/new-patient' ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217]' : 'bg-transparent'} w-full py-3 flex items-center justify-center   `}>New Patient</Link>
            <Link to={'/patient-record'} className={`${currentPath === '/patient-record' ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217]' : 'bg-transparent'} w-full py-3 flex items-center justify-center  `}>Patient Record</Link>
            <Link to={'/medicine-inventory'} className={`${currentPath === '/medicine-inventory' ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217]' : 'bg-transparent'} w-full py-3 flex items-center justify-center   `}>Medicine Inventory</Link>
        </div>
           
           
            <div className='h-[20%] w-full border-t  border-gray-300 flex justify-center flex flex-col'>
                
                {/* FOR PHYSICIAN NAME */}
                <div className='w-full h-[60%] bg-pink-100 flex gap-2'>

                    {/* FOR Initials */}
                    <div className='w-[30%] shrink-0 h-full flex items-center justify-center'>
                          <img
                            src={authenticatedUser?.user_metadata?.avatar_url}
                          className='bg-[#A12217] h-[70px] w-[70px]  sm:w-[50px] sm:h-[50px] rounded-full'/>
                    </div>

                    <div className='w-[70%] h-full text-black flex flex-col justify-center'>
                            <p className=' font-bold sm:text-[.9rem]'>{`Dr. ${authenticatedUser?.user_metadata?.name}`}</p>
                            <p className=' text-[.8rem] sm:text-[.7rem]'>Primary Core Physician</p>
                    </div>
                </div>


                {/* FOR SETTINGS AND LOG OUT */}
                <div className="h-[40%] w-full bg-violet-100 flex gap-10 justify-end px-10 sm:px-[10px] sm:gap-[30px] lg:px-10">
                    <button className='h-full flex items-center gap-[5px]'><img src={Mysettings}  className='h-[20px] text-red-100' alt="Settings" />
                    <p className='text-[.9rem]'>Settings</p>
                    </button>
                    <button className='h-full'><img src={Logout} alt="logout" className='h-[20px]' onClick={handleSignOut}/></button>
                </div>
                
            </div>
            </div>

  )
}

export default Navigation
