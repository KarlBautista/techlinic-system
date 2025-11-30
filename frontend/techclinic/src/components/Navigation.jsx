import React from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import TUP from "../assets/image/TUP.png"
import Logout from "../assets/image/logout.svg"
import useAuth from '../store/useAuthStore'
import Swal from 'sweetalert2'
import Mysettings from '../assets/image/settings.svg'

const Navigation = () => {
    const { authenticatedUser, signOut } = useAuth()
    const location = useLocation()
    const currentPath = location.pathname
    const navigate = useNavigate()

    const handleSignOut = async () => {
        try {
            console.log("🚪 Initiating sign out...");
            
            const response = await signOut()
            
            if (response?.error) {
                console.error("❌ Sign out error:", response.error);
                Swal.fire({
                    title: "Something went wrong",
                    imageUrl: TUP,
                    imageHeight: "150px",
                    imageWidth: "150px",
                    text: "Can't sign out. Please try again.",
                    icon: 'error'
                })
                return
            }

            console.log("✅ Sign out successful, navigating to login");
            
            // Navigate first
            navigate('/', { replace: true })
            
            // Show success message after navigation
            Swal.fire({
                title: 'Signed Out',
                imageUrl: TUP,
                imageHeight: '150px',
                imageWidth: '150px',
                text: 'Thank you for choosing Techclinic.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            })
            
        } catch (err) {
            console.error("❌ Sign out exception:", err)
            Swal.fire({
                title: "Error",
                text: "Failed to sign out. Please try again.",
                icon: 'error'
            })
        }
    }

    return (
        <div className='nav flex-row'>
            <div className='sm:h-[10%] sm:w-full w-[50%] h-[60px] border-b hidden border-gray-300 sm:flex items-center justify-center'>
                <div className='w-[90%] h-[80%] hidden sm:flex gap-2'>
                    <div className='w-[30%] h-full flex items-center justify-center'>
                        <img src={TUP} alt='TUP' className='h-full object-contain' />
                    </div>
                    <div className='h-full w-[70%] flex flex-col justify-center'>
                        <p className='xl:text-[1.2rem] text-[#A12217] font-bold md:text-[1rem]'>TechClinic</p>
                        <p className='xl:text-[.7rem] text-[#A12217] md:text-[.5rem] sm:text-[.7rem]'>Electronic Medical Record</p>
                    </div>
                </div>
            </div>

            <div className='h-[70%] w-full sm:flex hidden flex-col items-center justify-center gap-3'>
                <Link
                    to={'/dashboard'}
                    className={`${currentPath === '/dashboard' ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217] text-[#A12217]' : 'bg-transparent text-[#1f2937]'} w-full py-3 flex items-center justify-start px-4 transition-colors duration-150 font-semibold tracking-wide uppercase`}
                >
                    <span className='w-10 flex items-center justify-center'>
                        <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-[#b01c34]' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
                            <rect x='3' y='3' width='8' height='8' rx='1' strokeWidth='1.5' />
                            <rect x='13' y='3' width='8' height='8' rx='1' strokeWidth='1.5' />
                            <rect x='3' y='13' width='8' height='8' rx='1' strokeWidth='1.5' />
                            <rect x='13' y='13' width='8' height='8' rx='1' strokeWidth='1.5' />
                        </svg>
                    </span>
                    <span className='flex-1 text-left'>Dashboard</span>
                </Link>

                <Link
                    to={'/analytics'}
                    className={`${currentPath === '/analytics' ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217] text-[#A12217]' : 'bg-transparent text-[#1f2937]'} w-full py-3 flex items-center justify-start px-4 transition-colors duration-150 font-semibold tracking-wide uppercase`}
                >
                    <span className='w-10 flex items-center justify-center'>
                        <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-[#b01c34]' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
                            <path d='M3 3v18h18' strokeWidth='1.5' />
                            <path d='M7 13v6' strokeWidth='1.5' />
                            <path d='M12 9v10' strokeWidth='1.5' />
                            <path d='M17 5v14' strokeWidth='1.5' />
                        </svg>
                    </span>
                    <span className='flex-1 text-left'>Analytics</span>
                </Link>

                <Link
                    to={'/new-patient'}
                    className={`${currentPath === '/new-patient' ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217] text-[#A12217]' : 'bg-transparent text-[#1f2937]'} w-full py-3 flex items-center justify-center px-4 transition-colors duration-150 font-semibold tracking-wide uppercase`}
                >
                    <span className='w-10 flex items-center justify-center'>
                        <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-[#b01c34]' viewBox='0 0 20 20' fill='currentColor'>
                            <path d='M8 9a3 3 0 100-6 3 3 0 000 6zM2 18a6 6 0 1112 0H2z' />
                        </svg>
                    </span>
                    <span className='flex-1 text-left'>New Patient</span>
                </Link>

                <Link
                    to={'/patient-record'}
                    className={`${(currentPath === '/patient-record' || currentPath.startsWith('/individual-record')) ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217] text-[#A12217]' : 'bg-transparent text-[#1f2937]'} w-full py-3 flex items-center justify-start px-4 transition-colors duration-150 font-semibold tracking-wide uppercase`}
                >
                    <span className='w-10 flex items-center justify-center'>
                        <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-[#b01c34]' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6M9 16h6M9 8h6M5 6h14v12H5z' />
                        </svg>
                    </span>
                    <span className='flex-1 text-left'>Patient Record</span>
                </Link>

                <Link
                    to={'/medicine-inventory'}
                    className={`${currentPath === '/medicine-inventory' || currentPath === "/add-medicine" ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217] text-[#A12217]' : 'bg-transparent text-[#1f2937]'} w-full py-3 flex items-center justify-start px-4 transition-colors duration-150 font-semibold tracking-wide uppercase`}
                >
                    <span className='w-10 flex items-center justify-center'>
                        <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-[#b01c34]' viewBox='0 0 24 24' fill='none' stroke='currentColor'>
                            <rect x='3' y='7' width='18' height='10' rx='2' strokeWidth='1.5' />
                            <path d='M9 7V5a3 3 0 016 0v2' strokeWidth='1.5' />
                            <path d='M12 11v4' strokeWidth='1.8' />
                            <path d='M10 13h4' strokeWidth='1.8' />
                        </svg>
                    </span>
                    <span className='flex-1 text-left'>Medicine Inventory</span>
                </Link>

                <Link
                    to={'/notifications'}
                    className={`${currentPath === '/notifications' ? 'bg-[#FEF2F2] border-r-4 border-r-[#A12217] text-[#A12217]' : 'bg-transparent text-[#1f2937]'} w-full py-3 flex items-center justify-start px-4 transition-colors duration-150 font-semibold tracking-wide uppercase`}
                >
                    <span className='w-10 flex items-center justify-center'>
                        <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-[#b01c34]' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                        </svg>
                    </span>
                    <span className='flex-1 text-left'>Notifications</span>
                </Link>
            </div>

            <div className='h-[20%] w-full border-t border-gray-300 hidden sm:flex flex-col justify-center'>
                <div className='w-full h-[60%] bg-[#C41E3A] flex gap-2'>
                    <div className='w-[30%] shrink-0 h-full flex items-center justify-center'>
                        <img 
                            src={authenticatedUser?.user_metadata?.avatar_url || TUP} 
                            alt="User avatar"
                            className='h-[70px] w-[70px] sm:w-[50px] sm:h-[50px] rounded-full object-cover' 
                        />
                    </div>

                    <div className='w-[70%] h-full flex flex-col justify-center text-white'>
                        <p className='font-bold sm:text-[.9rem]'>
                            {authenticatedUser?.user_metadata?.name ? `Dr. ${authenticatedUser.user_metadata.name}` : authenticatedUser?.email || 'User'}
                        </p>
                        <p className='text-[.8rem] sm:text-[.7rem]'>Primary Core Physician</p>
                    </div>
                </div>

                <div className="h-[40%] w-full bg-[#b01c34ff] flex gap-10 justify-end px-10 sm:px-2.5 sm:gap-8 lg:px-10 text-white">
                    <button className='h-full flex items-center gap-[5px]' title='Settings'>
                        <img src={Mysettings} alt='Settings' className='h-5 object-contain' style={{ filter: 'brightness(0) invert(1)' }} />
                        <p className='text-[.9rem]'>Settings</p>
                    </button>
                    <button 
                        className='h-full flex items-center' 
                        onClick={handleSignOut} 
                        aria-label='Sign out' 
                        title='Sign out'
                    >
                        <img src={Logout} alt='logout' className='h-5 object-contain' style={{ filter: 'brightness(0) invert(1)' }} />
                    </button>
                </div>
            </div>
            
            <div className='w-[50%] h-[full] sm:hidden flex justify-end items-center'>
                <p className='text-3xl'>🍔</p>
            </div>
        </div>
    )
}

export default Navigation