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
             
        <div className='h-[70%] w-full flex flex-col items-center justify-center gap-3'>
                        <Link
                            to={'/dashboard'}
                            className={`${currentPath === '/dashboard' ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217] text-[#A12217]' : 'bg-transparent text-[#1f2937]'} w-full py-3 flex items-center justify-center transition-colors duration-150 font-semibold tracking-wide uppercase`}
                        >
                            Dashboard
                        </Link>

                        <Link
                            to={'/new-patient'}
                            className={`${currentPath === '/new-patient' ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217] text-[#A12217]' : 'bg-transparent text-[#1f2937]'} w-full py-3 flex items-center justify-center transition-colors duration-150 font-semibold tracking-wide uppercase`}
                        >
                            New Patient
                        </Link>

                        <Link
                            to={'/patient-record'}
                            className={`${(currentPath === '/patient-record' || currentPath.startsWith('/individual-record')) ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217] text-[#A12217]' : 'bg-transparent text-[#1f2937]'} w-full py-3 flex items-center justify-center transition-colors duration-150 font-semibold tracking-wide uppercase`}
                        >
                            Patient Record
                        </Link>

                        <Link
                            to={'/medicine-inventory'}
                            className={`${currentPath === '/medicine-inventory' || currentPath === "/add-medicine" ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217] text-[#A12217]' : 'bg-transparent text-[#1f2937]'} w-full py-3 flex items-center justify-center transition-colors duration-150 font-semibold tracking-wide uppercase`}
                        >
                            Medicine Inventory
                        </Link>
                </div>
           
            <div className='h-[20%] w-full border-t border-gray-300 flex flex-col justify-center'>
                <div className='w-full h-[60%] bg-[#C41E3A] flex gap-2'>

             
                      <div className='w-[30%] shrink-0 h-full flex items-center justify-center'>
                          <img
                            src={authenticatedUser?.user_metadata?.avatar_url}
                          className=' h-[70px] w-[70px]  sm:w-[50px] sm:h-[50px] rounded-full'/>
                    </div>

                      <div className='w-[70%] h-full flex flex-col justify-center text-white'>
                            <p className=' font-bold sm:text-[.9rem]'>{`Dr. ${authenticatedUser?.user_metadata?.name}`}</p>
                            <p className=' text-[.8rem] sm:text-[.7rem]'>Primary Core Physician</p>
                    </div>
                </div>


                <div className="h-[40%] w-full bg-[hsl(350,73%,40%)] flex gap-10 justify-end px-10 sm:px-2.5 sm:gap-8 lg:px-10 text-white">
                                        <button className='h-full flex items-center gap-[5px]' title='Settings'>
                                              <img src={Mysettings} alt="Settings" className='h-5 object-contain' style={{filter: 'brightness(0) invert(1)'}} />
                                            <p className='text-[.9rem]'>Settings</p>
                                        </button>
                                        <button className='h-full' onClick={() => handleSignOut()} aria-label="Sign out" title='Sign out'>
                                              <img src={Logout} alt="logout" className='h-5 object-contain' style={{filter: 'brightness(0) invert(1)'}} />
                                        </button>
                </div>
                
            </div>
            </div>

  )
}

export default Navigation
