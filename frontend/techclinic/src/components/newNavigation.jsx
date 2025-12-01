import '../componentCss/newNavigation.css'
import DashboardImage from '../assets/componentImage/dashboard.svg'
import MedicineImage from '../assets/componentImage/medicine.svg'
import ProfileImage from '../assets/componentImage/profilee.svg'
import PatientImage from '../assets/componentImage/patient.svg'
import RecordImage from '../assets/componentImage/record.svg'
import TUP from '../assets/image/TUP.png'
import Settings from '../assets/image/settings.svg'
import Logout from '../assets/image/logout.svg'
import Analytics from '../assets/componentImage/analytics.svg'
import Notification from '../assets/componentImage/notification.svg'
import useAuth from '../store/useAuthStore'
import Swal from 'sweetalert2'

import { useLocation, Link, useNavigate } from 'react-router-dom'

const NewNavigation = () => {
    const { authenticatedUser, userProfile, signOut } = useAuth();
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            const response = await signOut();
            
            if (response?.error) {
                Swal.fire({
                    title: "Something went wrong",
                    imageUrl: TUP,
                    imageHeight: "150px",
                    imageWidth: "150px",
                    text: "Can't sign out. Please try again.",
                    icon: 'error'
                });
                return;
            }

        
        
            navigate('/', { replace: true });
            
       
            Swal.fire({
                title: 'Signed Out',
                imageUrl: TUP,
                imageHeight: '150px',
                imageWidth: '150px',
                text: 'Thank you for choosing Techclinic.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            
        } catch (err) {
           
            Swal.fire({
                title: "Error",
                text: "Failed to sign out. Please try again.",
                icon: 'error'
            });
        }
    }

    return (
        <div className="border-t h-full w-full flex justify-evenly gap-1 min-w-[360px] sm:min-w-0 sm:flex-col 
            sm:border-r sm:border-gray-300">
            
        <>
         <Link to={'/dashboard'} className='navigationContainer'>
                <img src={DashboardImage} alt="Dashboard" />
            </Link>
            <Link to={'/analytics'} className='navigationContainer'>
                <img src={Analytics} alt="Analytics" />
            </Link>
            <Link to={'/new-patient'} className='navigationContainer'>
                <img src={PatientImage} alt="New Patient" />
            </Link>
            <Link to={'/patient-record'} className='navigationContainer'>
                <img src={RecordImage} alt="Patient Record" />
            </Link>
            <Link to={'/medicine-inventory'} className='navigationContainer'>
                <img src={MedicineImage} alt="Medicine Inventory" />
            </Link>
            <div className='navigationContainer'>
                <img src={ProfileImage} alt="Profile" />    
            </div>
        </>
           

         
            <div className='newNavigationContainer h-[10%] w-full gap-1 p-1 border-b border-gray-300'>
                <div className='w-[30%] h-full flex items-center justify-center'>
                    <img src={TUP} className='h-[80%] object-contain' alt="TUP Logo" />
                </div>
                <div className='h-full flex flex-col w-[70%] justify-center'>
                    <p className='text-[#A12217] font-bold sm:text-[1rem] xl:text-[1.6rem] 2xl:text-[1.8rem] md:text-[1.3rem]'>TechClinic</p>
                    <p className='text-[#A12217] text-[.5rem] md:text-[.6rem] xl:text-[.7rem] 2xl:text-[.9rem]'>Electronic Medical Record</p>
                </div>
            </div>

        {userProfile?.role === "NURSE" ? (
            <>
             <div className='newNavigationContainer gap-2 flex-col justify-center h-[70%] w-full'>
                <Link 
                    to={'/dashboard'}
                    className={`${currentPath === '/dashboard' ? 'inPage' : 'notPage'} mainNavigation`}
                >
                    <img src={DashboardImage} alt="Dashboard" />
                    <p>DASHBOARD</p>
                </Link>
                
                <Link 
                    to={'/analytics'}
                    className={`${currentPath === '/analytics' ? 'inPage' : 'notPage'} mainNavigation`}
                >
                    <img src={Analytics} alt="Analytics" />
                    <p>ANALYTICS</p>
                </Link>
                
                <Link 
                    to={'/new-patient'}
                    className={`${currentPath === '/new-patient' ? 'inPage' : 'notPage'} mainNavigation`}
                >
                    <img src={PatientImage} alt="New Patient" />
                    <p>NEW PATIENT</p>
                </Link>
                
                <Link 
                    to={'/patient-record'}
                    className={`${(currentPath === '/patient-record' || currentPath.startsWith('/individual-record')) ? 'inPage' : 'notPage'} mainNavigation`}
                >
                    <img src={RecordImage} alt="Patient Record" />
                    <p>PATIENT RECORD</p>
                </Link>
                
                <Link 
                    to={'/medicine-inventory'}
                    className={`${(currentPath === '/medicine-inventory' || currentPath === '/add-medicine') ? 'inPage' : 'notPage'} mainNavigation`}
                >
                    <img src={MedicineImage} alt="Medicine Inventory" />
                    <p>MEDICINE INVENTORY</p>
                </Link>

                <Link 
                    to={'/notifications'}
                    className={`${currentPath === '/notifications' ? 'inPage' : 'notPage'} mainNavigation`}
                >
                    <img src={Notification} alt="Notifications" />
                    <p>NOTIFICATION</p>
                </Link>
            </div>
            </>
        ) : (
            <>
             <div className='newNavigationContainer gap-2 flex-col justify-center h-[70%] w-full'>
                <Link 
                    to={'/dashboard'}
                    className={`${currentPath === '/dashboard' ? 'inPage' : 'notPage'} mainNavigation`}
                >
                    <img src={DashboardImage} alt="Dashboard" />
                    <p>DASHBOARD</p>
                </Link>
                
                <Link 
                    to={'/analytics'}
                    className={`${currentPath === '/analytics' ? 'inPage' : 'notPage'} mainNavigation`}
                >
                    <img src={Analytics} alt="Analytics" />
                    <p>ANALYTICS</p>
                </Link>
                
                <Link 
                    to={'/personnel-list'}
                    className={`${currentPath === '/personnel-list' ? 'inPage' : 'notPage'} mainNavigation`}
                >
                    <img src={PatientImage} alt="New Patient" />
                    <p>PERSONNEL LIST</p>
                </Link>
                
                <Link 
                    to={'/patient-record'}
                    className={`${(currentPath === '/patient-record' || currentPath.startsWith('/individual-record')) ? 'inPage' : 'notPage'} mainNavigation`}
                >
                    <img src={RecordImage} alt="Patient Record" />
                    <p>PATIENT RECORD</p>
                </Link>
                
                <Link 
                    to={'/medicine-inventory'}
                    className={`${(currentPath === '/medicine-inventory' || currentPath === '/add-medicine') ? 'inPage' : 'notPage'} mainNavigation`}
                >
                    <img src={MedicineImage} alt="Medicine Inventory" />
                    <p>MEDICINE INVENTORY</p>
                </Link>

                <Link 
                    to={'/notifications'}
                    className={`${currentPath === '/notifications' ? 'inPage' : 'notPage'} mainNavigation`}
                >
                    <img src={Notification} alt="Notifications" />
                    <p>NOTIFICATION</p>
                </Link>
            </div>
            </>
        )}
           

  
            <div className='newNavigationContainer h-[20%] w-full flex-col p-1 bg-[hsl(350,73%,40%)] text-white'>
                <div className='h-[60%] w-full flex gap-2 items-center justify-center'>
                    <div className='w-[50px] h-[50px] 2xl:w-17 2xl:h-17 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden'>
                        {authenticatedUser?.user_metadata?.avatar_url ? (
                            <img 
                                src={authenticatedUser.user_metadata.avatar_url} 
                                className='w-full h-full object-cover rounded-full' 
                                alt="User avatar" 
                            />
                        ) : (
                            <img 
                                src={TUP} 
                                className='w-full h-full object-contain p-2' 
                                alt="Default avatar" 
                            />
                        )}
                    </div>
                    <div className='w-[60%] h-full flex flex-col justify-center xl:w-[70%]'>
                        <p className='font-bold text-[.7rem] md:text-[.8rem] lg:text-[.9rem] 2xl:text-[1.1rem]'>
                            {userProfile?.first_name && userProfile?.last_name
                                ? `Dr. ${userProfile.first_name} ${userProfile.last_name}`
                                : authenticatedUser?.user_metadata?.name 
                                ? `Dr. ${authenticatedUser.user_metadata.name}` 
                                : authenticatedUser?.email || 'User'}
                        </p>
                        <p className='text-[.5rem] xl:text-[.8rem] 2xl:text-[1.1rem]'>
                            {userProfile?.role || 'Primary Core Physician'}
                        </p>
                    </div>
                </div>
                
                <div className='Settings h-[40%] w-full flex justify-end items-center gap-6 pr-4'>
                    <button 
                        className='flex gap-1 justify-center items-center hover:opacity-80 transition-opacity'
                        title="Settings"
                    >
                        <img src={Settings} alt="Settings" className='w-5 h-5' />
                        <p className='text-[.8rem]'>Settings</p>
                    </button>
                    
                    <button 
                        onClick={handleSignOut}
                        className='hover:opacity-80 transition-opacity'
                        title="Sign out"
                        aria-label="Sign out"
                    >
                        <img src={Logout} alt="Logout" className='w-5 h-5' />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NewNavigation