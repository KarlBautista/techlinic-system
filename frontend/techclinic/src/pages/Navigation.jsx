import React from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import TUP from "../assets/image/TUP.png"
import Logout from "../assets/image/logout.png"
import useAuth from '../store/useAuthStore'
import Swal from 'sweetalert2'
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
        <div className='nav md:w-[25%]'>
                <div className='h-[10%] w-full border-b border-gray-300 flex items-center justify-center'>
        <div className='w-[90%] h-[80%] flex gap-2'>
             <div className='w-[30%] h-full flex items-center justify-center'>
                <img src={TUP} alt="TUP" className='h-[60%] md:h-[70%] object-contain'/>
            </div>
                <div className='h-full w-[70%] flex flex-col justify-center'>
                    <p className='xl:text-[1.2rem] text-[#A12217] font-bold md:text-[1rem]'>TechClinic</p>
                    <p className='xl:text-[.7rem] text-[#A12217] md:text-[.5rem]'>Electronic Medical Record</p>
                </div>
        </div>
        </div>
             {/* logout btn svg to */}
        <div className='w-full h-[5%]  flex justify-start items-center px-8 py-6'>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className='text-[#A12217] w-4 h-4 md:w-6 md:h-6 cursor-pointer'
                aria-hidden="true"
                onClick={() => handleSignOut()}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
            </svg>
        </div>
    <div className='h-[70%] w-full flex flex-col items-center justify-center text-[0.9rem] gap-3'>
            <Link to={'/dashboard'} className={`${currentPath === '/dashboard' ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217]' : 'bg-transparent'} w-full py-3 flex items-center justify-center text-[#A12217] text-base md:text-lg font-semibold`}>Dashboard</Link>
            <Link to={'/new-patient'} className={`${currentPath === '/new-patient' ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217]' : 'bg-transparent'} w-full py-3 flex items-center justify-center text-[#A12217] text-base md:text-lg font-semibold`}>New Patient</Link>
            <Link to={'/patient-record'} className={`${currentPath === '/patient-record' ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217]' : 'bg-transparent'} w-full py-3 flex items-center justify-center text-[#A12217] text-base md:text-lg font-semibold`}>Patient Record</Link>
            <Link to={'/medicine-inventory'} className={`${currentPath === '/medicine-inventory' ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217]' : 'bg-transparent'} w-full py-3 flex items-center justify-center text-[#A12217] text-base md:text-lg font-semibold`}>Medicine Inventory</Link>
        </div>
            <div className='h-[20%] w-full border-t border-gray-300 flex items-center justify-center bg-[#A12217]'>
                <div className='w-[90%] flex items-center gap-2 text-center justify-center '>
                     <div className='shrink-0'>
                         <img
                            src={authenticatedUser?.user_metadata?.avatar_url}
                            className='h-8 w-8 md:h-12 md:w-12 rounded-full bg-white object-cover'
                                />
                            </div>
                            <div className='text-white'>
                                <p className='md:text-[0.95rem] font-bold'>{`Dr. ${authenticatedUser?.user_metadata?.name}`}</p>
                                <p className='md:text-[0.8rem] text-white/90'>Primary Core Physician</p>
                            </div>
                        </div>
                </div>
    </div>

  )
}

export default Navigation
