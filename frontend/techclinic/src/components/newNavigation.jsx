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
            // Show confirmation dialog first
            const result = await Swal.fire({
                title: 'Sign Out?',
                text: 'Are you sure you want to sign out?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#B22222',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, sign out',
                cancelButtonText: 'Cancel'
            });

            if (!result.isConfirmed) {
                return; // User cancelled
            }

            console.log("🚪 User confirmed sign out");
            
            // Perform sign out
            const response = await signOut();
            
            if (response?.error) {
                console.error("Sign out error:", response.error);
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

            console.log("✅ Sign out successful");
            
            // Show success message
            await Swal.fire({
                title: 'Signed Out',
                imageUrl: TUP,
                imageHeight: '150px',
                imageWidth: '150px',
                text: 'Thank you for choosing Techclinic.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            
            // Navigate AFTER showing message
            navigate('/', { replace: true });
            
            // Force a hard refresh to clear any remaining state
            setTimeout(() => {
                window.location.href = '/';
            }, 100);
            
        } catch (err) {
            console.error("Sign out error:", err);
            Swal.fire({
                title: "Error",
                text: "Failed to sign out. Please try again.",
                icon: 'error'
            });
        }
    }

    // Helper function to get display name
    const getDisplayName = () => {
        if (userProfile?.first_name && userProfile?.last_name) {
            return `Dr. ${userProfile.first_name} ${userProfile.last_name}`;
        }
        if (authenticatedUser?.user_metadata?.full_name) {
            return `Dr. ${authenticatedUser.user_metadata.full_name}`;
        }
        if (authenticatedUser?.user_metadata?.name) {
            return `Dr. ${authenticatedUser.user_metadata.name}`;
        }
        if (authenticatedUser?.email) {
            return authenticatedUser.email.split('@')[0];
        }
        return 'User';
    };


    const getInitials = () => {
    const name = getDisplayName();
    const parts = name.replace('Dr. ', '').split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
};

    return (
        <div className="border-t h-full w-full flex justify-evenly gap-1 min-w-[360px] sm:min-w-0 sm:flex-col 
            sm:border-r sm:border-gray-300 shadow-2xl">
        
            <div className='newNavigationContainer h-[10%] w-full gap-1 p-1 border-b border-gray-300'>
                <div className='w-[30%] h-full flex items-center justify-center'>
                    <img src={TUP} className='h-[80%] object-contain' alt="TUP Logo" />
                </div>
                <div className='h-full flex flex-col w-[70%] justify-center'>
                    <p className='text-[#A12217] font-bold sm:text-[1rem] xl:text-[1.6rem] lg:text-[1.5rem] 2xl:text-[1.8rem] md:text-[1.1rem]'>TechClinic</p>
                    <p className='text-[#A12217] text-[.5rem] md:text-[.5rem] xl:text-[.7rem] 2xl:text-[.9rem]'>Electronic Medical Record</p>
                </div>
            </div>

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


            {userProfile?.role === "NURSE" ? (
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
            ) : (
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
                        <img src={PatientImage} alt="Personnel List" />
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
            )}
           
            {/* User Profile Section */}
            <div className='newNavigationContainer h-[20%] w-full flex-col p-1 bg-[#C41E3A] text-white'>
                <div className='h-[60%] w-full flex gap-2 items-center justify-center'>
                    <div className='w-[50px] h-[50px]  2xl:w-15 2xl:h-15 rounded-full bg-white flex items-center justify-center overflow-hidden'>
                        <p className='text-black sm:text-[1.5rem] md:text-[1.5rem] lg:text-[1.5rem] xl:text-[1.9rem]  font-bold'>{getInitials()}</p>
                    </div>
                    <div className='w-[60%] h-full flex flex-col justify-center xl:w-[70%]'>
                        <p className='font-bold text-[.7rem] md:text-[.8rem] lg:text-[.9rem] 2xl:text-[1.1rem]'>
                            {getDisplayName()}
                        </p>
                        <p className='text-[.5rem] xl:text-[.8rem] 2xl:text-[1rem]'>
                            {'Attending Personnel'}
                        </p>
                    </div>
                </div>
                
                <div className='Settings bg-[#b01c34ff] h-[40%] w-full flex justify-end items-center gap-6 pr-4'>
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