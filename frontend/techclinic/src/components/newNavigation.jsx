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
import Swal from 'sweetalert2'


import { useLocation, Link, useNavigate } from 'react-router-dom'



const newNavigation = () => {

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


    return(
        <div className="border-t h-full w-full flex justify-evenly gap-1 min-w-[360px] sm:min-w-0 sm:flex-col 
            sm:border-r sm:border-gray-300 

        ">
            <div className='navigationContainer'>
                <img src={DashboardImage} alt="" />
            </div>
            <div className='navigationContainer'>
                <img src={PatientImage} alt="" />
            </div>
            <div className='navigationContainer'>
                <img src={RecordImage} alt="" />
            </div>
            <div className='navigationContainer'>
                <img src={MedicineImage} alt="" />
            </div>
            <div className='navigationContainer'>
                <img src={Notification} alt="" />    
            </div>
            <div className='navigationContainer'>
                <img src={ProfileImage} alt="" />    
            </div>


            <div className='newNavigationContainer h-[10%] w-full gap-1 p-1 border-b border-gray-300'>
                <div className='w-[30%] h-full flex items-center justify-center'>
                    <img src={TUP} className='h-full  object-contain'  alt="" />
                </div>
                <div className='h-full flex flex-col w-[70%] justify-center'>
                    <p className='text-[#A12217] font-bold sm:text-[1.2rem] xl:text-[1.9rem] 2xl:text-[2rem] md:text-[1.5rem]'>TechClinic</p>
                    <p className='text-[#A12217] text-[.6rem] md:text-[.6rem] xl:text-[.8rem] 2xl:text-[1rem]'>Electronic Medical Record</p>
                </div>
            </div>


            <div className='newNavigationContainer gap-2 flex-col justify-center h-[70%] w-full'>
                <Link 
                to={'/dashboard'}
                className={`${currentPath === '/dashboard' ? 'inPage' : 'notPage'} mainNavigation`}>
                    <p>DASHBOARD</p>
                </Link>
                <Link 
                to={'/new-patient'}
                className={`${currentPath === '/new-patient' ? 'inPage' : 'notPage'} mainNavigation`}>
                    <p>NEW PATIENT</p>
                </Link>
                <Link 
                to={'/patient-record'}
                className={`${currentPath === '/patient-record' ? 'inPage' : 'notPage'} mainNavigation`}>
                    <p>PATIENT RECORD</p>
                </Link>
                <Link 
                to={'/medicine-inventory'}
                className={`${currentPath === '/medicine-inventory' ? 'inPage' : 'notPage'} mainNavigation`}>
                    <p>MEDICINE INVENTORY</p>
                </Link>

            </div>

            <div className='newNavigationContainer h-[20%] w-full flex-col p-1 bg-[hsl(350,73%,40%)] text-white' >
                <div className='h-[60%] w-full flex gap-2 items-center justify-center'>
                    <div className='w-[50px] h-[50px] 2xl:w-17  2xl:h-17 rounded-full bg-amber-100 flex items-center justify-center'>
                    <img src={authenticatedUser?.user_metadata?.avatar_url} className='rounded-full' alt="" />
                    </div>
                    <div className='w-[60%]  h-full flex flex-col justify-center xl:w-[70%]'>
                        <p className=' font-bold text-[.8rem] md:text-[.9rem] lg:text-[1rem] 2xl:text-[1.3rem]'>{`Dr. ${authenticatedUser?.user_metadata?.name}`}</p>
                        <p className=' text-[.6rem] xl:text-[.9rem] 2xl:text-[1.2rem]'>Primary Core Physician</p>
                    </div>
                </div>
                <div className='Settings h-[40%] w-full flex justify-end items-center gap-6' >
                    <button className='flex gap-1 justify-center items-center'>
                        <img src={Settings} alt="" />
                        <p className='text-[.9rem]'>Settings</p>
                    </button>
                    <button>
                        <img src={Logout}  alt="" />
                    </button>
                </div>
            </div>
        </div>
    )
}


export default newNavigation