import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import TUP from "../assets/image/TUP.png"

const Navigation = () => {

 
    const location = useLocation();
    const currentPath = location.pathname;
    const lastName = useRef("karl");
    const firstName = useRef("bautista");
    const initial = useRef(null);
    useEffect(() => {
        if (initial.current && lastName.current && firstName.current) {
            initial.current.textContent = `${lastName.current[0].toLocaleUpperCase() + firstName.current[0].toLocaleUpperCase()}`;
        }
    }, []);

    return (
        <div className='nav md:w-[25%]'>
                <div className='h-[10%] w-full border-b border-gray-300 flex items-center justify-center'>
        <div className='w-[90%] h-[80%] flex gap-2'>
             <div className='w-[30%] h-full flex items-center justify-center'>
                <img src={TUP} alt="TUP" className='h-[80%]'/>
            </div>
                <div className='h-full w-[70%] flex flex-col justify-center'>
                    <p className='xl:text-[1.2rem] text-[#A12217] font-bold md:text-[1rem]'>TechClinic</p>
                    <p className='xl:text-[.7rem] text-[#A12217] md:text-[.5rem]'>Electronic Medical Record</p>
                </div>
        </div>
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
                         <div
                            ref={initial}
                            className='h-12 w-12 md:h-14 md:w-14 rounded-full bg-white flex items-center justify-center text-[#A12217] font-bold text-lg md:text-xl'
                                />
                            </div>
                            <div className='text-white'>
                                <p className='md:text-[0.95rem] font-bold'>Dr. Karl Bautista</p>
                                <p className='md:text-[0.8rem] text-white/90'>Primary Core Physician</p>
                            </div>
                        </div>
                </div>
    </div>

  )
}

export default Navigation
