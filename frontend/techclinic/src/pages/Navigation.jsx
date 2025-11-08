import React from 'react'
import { useLocation } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import TUP from "../assets/image/TUP.png"

const Navigation = () => {

 
    const location = useLocation();
    const currentPath = location.pathname;

    const lastName=useRef("karl");
    const firstName=useRef("bautista");
    const initial = useRef(null)


    console.log(initial.current)
    
    useEffect( () => {
        initial.current.textContent = `${lastName.current[0].toLocaleUpperCase() + firstName.current[0].toLocaleUpperCase()}`;
    })

  return (
    <div className='nav md:w-[25%]]'>
        <div className='h-[10%] w-full border-b-1 border-b-gray-300 flex items-center justify-center'>
           
           
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

        <div className='h-[70%] w-full flex flex-col items-start justify-center  text-[0.8rem] gap-4'>
            <button className={`${currentPath === '/dashboard' ? 'bg-[#FEF2F2] border-r-5 border-r-[#A12217]' : 'bg-transparent'} w-full py-2`}>Dashboard</button>
            <button className={`${currentPath === '/newPatient' ? 'bg-[#FEF2F2] border-r-2 border-r-[#A12217]' : 'bg-transparent'} w-full py-2`}>New Patient</button>
            <button className={`${currentPath === '/patientRecord' ? 'bg-[#FEF2F2] border-r-2 border-r-[#A12217]' : 'bg-transparent'} w-full py-2`}>Patient Record</button>
            <button className={`${currentPath === '/medicineInventory' ? 'bg-[#FEF2F2] border-r-2 border-r-[#A12217]' : 'bg-transparent'} w-full py-2`}>Medicine Inventory</button>
        </div>



        <div className='h-[20%] w-full border-t-1 border-t-gray-300 flex flex-col'>
                <div className='h-[60%] w-full flex'>
                    <div className='w-[40%] flex items-center justify-center'>
                        <div className='md:bg-black md:h-[50px] md:w-[50px] rounded-full flex items-center justify-center text-white md:text-[1.5rem] font-bold 
                        
                        
                        ' ref={initial} >

                        </div>
                    </div>
                    <div className='xl:w-[60%] flex flex-col justify-center'>
                        <p className='
                            md:text-[.7rem] font-bold
                        
                        
                        '>Dr. Karl Bautista</p>
                        <p className='md:text-[.5rem]'>Primary Core Physician</p>
                    </div>
                </div>
                <div className='h-[40%] w-full '>

                </div>
        </div>
    </div>

  )
}

export default Navigation
