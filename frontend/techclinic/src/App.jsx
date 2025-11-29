import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './pages/Login'
import { RouterProvider } from 'react-router-dom'
import router from "./router/router"
import useAuth from './store/useAuthStore'
import useData from './store/useDataStore'
import useMedicine from './store/useMedicineStore'
function App() {
    const { authListener, getUser } = useAuth();
    const { getRecords, getPatients } = useData();
    const { getMedicines } = useMedicine();
    useEffect(() => {
        getUser();
        getRecords();
        getPatients();
        getMedicines();
        const unsubscribe = authListener();
        return () => {
            if(unsubscribe && typeof unsubscribe === "function"){
                unsubscribe();
            }
        }
    }, [authListener, getUser]);
 return(
    <div className='w-full h-screen'>
        <RouterProvider router={router}/>
    </div>
 )
}

export default App
