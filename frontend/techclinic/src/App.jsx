import { useEffect, useState } from 'react'
import './App.css'
import { RouterProvider } from 'react-router-dom'
import router from "./router/router"
import useAuth from './store/useAuthStore'
import useData from './store/useDataStore'
import useMedicine from './store/useMedicineStore'

function App() {
    const { authListener, getUser, getAllUsers } = useAuth();
    const { getRecords, getPatients } = useData();
    const { getMedicines } = useMedicine();
    const [isInitialized, setIsInitialized] = useState(false);
    
    useEffect(() => {
        let unsubscribe;
        
        const initialize = async () => {
          
     
        
        
            await getUser();
      
            await Promise.all([
                getRecords(),
                getPatients(),
                getMedicines(),
                getAllUsers(),
             
            ]);
            
            setIsInitialized(true);
    
        };
        
        initialize();
        
        return () => {
            if (unsubscribe && typeof unsubscribe === "function") {
                unsubscribe();
            }
        };
    }, []); 
    
    return (
        <div className='w-full h-screen'>
            <RouterProvider router={router}/>
        </div>
    );
}

export default App