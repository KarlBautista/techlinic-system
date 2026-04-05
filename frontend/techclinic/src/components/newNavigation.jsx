import '../componentCss/newNavigation.css'
import DashboardImage from '../assets/componentImage/dashboard.svg'
import MedicineImage from '../assets/componentImage/medicine.svg'
import ProfileImage from '../assets/componentImage/profilee.svg'
import PatientImage from '../assets/componentImage/patient.svg'
import RecordImage from '../assets/componentImage/record.svg'
import TUP from '../assets/image/TUP.png'
import Settings from '../assets/image/settings.svg'
import Logout from '../assets/image/logout.svg'
import Notification from '../assets/componentImage/notification.svg'
import useAuth from '../store/useAuthStore'
import useNotificationStore, { requestNotificationPermission } from '../store/useNotificationStore'
import NotificationModal from './NotificationModal'
import { showToast } from './Toast'
import { showModal } from './Modal'
import { useEffect, useState, useRef } from 'react'

import { useLocation, Link, useNavigate } from 'react-router-dom'

const NewNavigation = () => {
    const { authenticatedUser, userProfile, signOut } = useAuth();
    const { unreadCount, fetchNotifications, checkForAlerts } = useNotificationStore();
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const profileMenuRef = useRef(null);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Request notification permission and start polling
    useEffect(() => {
        if (!authenticatedUser?.id) return;
        
        // Request browser notification permission
        requestNotificationPermission();
        
        // Initial fetch only (no checkForAlerts on mount — interval handles it)
        fetchNotifications(authenticatedUser.id);
        
        // Poll every 30 seconds
        const intervalId = setInterval(() => {
            checkForAlerts(authenticatedUser.id);
        }, 30000);
        
        return () => clearInterval(intervalId);
    }, [authenticatedUser?.id]);

    const handleSignOut = async () => {
        try {
            // Show confirmation dialog first
            const confirmed = await showModal({
                type: 'warning',
                title: 'Sign Out?',
                message: 'Are you sure you want to sign out?',
                confirmLabel: 'Yes, sign out',
                cancelLabel: 'Cancel',
            })

            if (!confirmed) {
                return; // User cancelled
            }

            console.log("🚪 User confirmed sign out");
            
            // Perform sign out
            const response = await signOut();
            
            if (response?.error) {
                console.error("Sign out error:", response.error);
                showToast({ title: 'Something went wrong', message: "Can't sign out. Please try again.", type: 'error' })
                return;
            }

            console.log("✅ Sign out successful");
            
            // Show success message
            showToast({ title: 'Signed Out', message: 'Thank you for choosing Techclinic.', type: 'success' })
            
            // Navigate AFTER showing message
            navigate('/', { replace: true });
            
            // Force a hard refresh to clear any remaining state
            setTimeout(() => {
                window.location.href = '/';
            }, 100);
            
        } catch (err) {
            console.error("Sign out error:", err);
            showToast({ title: 'Error', message: 'Failed to sign out. Please try again.', type: 'error' })
        }
    }

    
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

    const handleSettings = () => {
        navigate("/settings");
    }

const getInitials = () => {
    const name = getDisplayName().replace("Dr. ", "").trim();

    if (!name) return "U"; // default

    const parts = name.split(" ").filter(Boolean);

    // If only one name exists
    if (parts.length === 1) {
        return parts[0][0].toUpperCase();
    }

    // Always use first and last parts (first name + last name)
    const firstInitial = parts[0][0];
    const lastInitial = parts[parts.length - 1][0];

    return (firstInitial + lastInitial).toUpperCase();
};

    return (
        <div className="border-t h-full w-full flex justify-evenly gap-1 min-w-[360px] sm:min-w-0 sm:flex-col 
            sm:border-r sm:border-gray-200 dark:border-[#1F2A37] bg-white dark:bg-[#161B26]">
        
            {/* ─── Logo / Brand ─── */}
            <div className='newNavigationContainer h-[10%] w-full gap-3 px-4 py-3 border-b border-gray-100 dark:border-[#1F2A37]'>
                <div className='w-10 h-10 xl:w-12 xl:h-12 flex items-center justify-center shrink-0'>
                    <img src={TUP} className='h-full w-full object-contain' alt="TUP Logo" />
                </div>
                <div className='h-full flex flex-col justify-center'>
                    <p className='text-[#b01c34] font-bold text-sm xl:text-lg lg:text-base 2xl:text-xl leading-tight tracking-tight'>TechClinic</p>
                    <p className='text-gray-400 dark:text-[#94969C] text-[0.6rem] xl:text-xs 2xl:text-xs font-medium'>Electronic Medical Record</p>
                </div>
            </div>

            {/* ─── Mobile Bottom Nav ─── */}
            <>
                <Link to={'/dashboard'} className='navigationContainer'>
                    <img src={DashboardImage} alt="Dashboard" />
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

            {/* ─── Desktop Nav Links ─── */}
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

                    <button 
                        onClick={() => setShowNotifications(true)}
                        className={`${currentPath === '/notifications' ? 'inPage' : 'notPage'} mainNavigation relative`}
                    >
                        <div className="relative">
                            <img src={Notification} alt="Notifications" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-2 bg-[#b01c34] text-white text-[0.6rem] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <p>NOTIFICATION</p>
                    </button>
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

                    <button 
                        onClick={() => setShowNotifications(true)}
                        className="notPage mainNavigation relative"
                    >
                        <div className="relative">
                            <img src={Notification} alt="Notifications" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-2 bg-[#b01c34] text-white text-[0.6rem] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <p>NOTIFICATION</p>
                    </button>
                </div>
            )}
           
            {/* ─── User Profile Section ─── */}
            <div className='newNavigationContainer h-[15%] w-full border-t border-gray-100 dark:border-[#1F2A37] relative' ref={profileMenuRef}>
                <button
                    onClick={() => setShowProfileMenu(prev => !prev)}
                    className='w-full h-full flex gap-3 items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] transition-colors cursor-pointer'
                >
                    <div className='w-10 h-10 xl:w-11 xl:h-11 2xl:w-12 2xl:h-12 rounded-full bg-linear-to-br from-[#b01c34] to-[#d4375a] flex items-center justify-center shrink-0 shadow-sm'>
                        <p className='text-white text-sm xl:text-base 2xl:text-lg font-bold'>{getInitials()}</p>
                    </div>
                    <div className='min-w-0 flex flex-col justify-center text-left flex-1'>
                        <p className='font-semibold text-gray-800 dark:text-white text-xs lg:text-sm 2xl:text-sm truncate leading-tight'>
                            {getDisplayName()}
                        </p>
                        <p className='text-gray-400 dark:text-[#94969C] text-[0.6rem] xl:text-xs font-medium'>
                            {userProfile?.role === "DOCTOR" ? "Attending Physician" : "Attending Personnel"}
                        </p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-gray-400 dark:text-[#94969C] shrink-0 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                    </svg>
                </button>

                {/* Popover Menu */}
                {showProfileMenu && (
                    <div className='absolute bottom-full left-2 right-2 mb-1 bg-white dark:bg-[#161B26] rounded-lg shadow-lg ring-1 ring-gray-200 dark:ring-[#1F2A37] py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150'>
                        <button
                            onClick={() => { handleSettings(); setShowProfileMenu(false); }}
                            className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1F242F] dark:bg-[#1F242F] hover:text-[#b01c34] transition-colors'
                        >
                            <img src={Settings} alt="Settings" className='w-4 h-4 opacity-60' />
                            <span>Settings</span>
                        </button>
                        <div className='mx-3 border-t border-gray-100 dark:border-[#1F2A37]' />
                        <button
                            onClick={() => { handleSignOut(); setShowProfileMenu(false); }}
                            className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 hover:text-[#b01c34] transition-colors'
                        >
                            <img src={Logout} alt="Logout" className='w-4 h-4 opacity-60' />
                            <span>Sign out</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Notification Modal */}
            <NotificationModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        </div>
    )
}

export default NewNavigation