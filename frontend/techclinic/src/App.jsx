import { useEffect } from 'react'
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
    
    useEffect(() => {
        // 1. Start the auth listener for real-time session changes
        const unsubscribe = authListener();
        
        // 2. Verify current session and load data
        const initialize = async () => {
            // This validates the Supabase session and sets isSessionVerified
            await getUser();
      
            // Only load app data if user is authenticated
            const { authenticatedUser } = useAuth.getState();
            if (authenticatedUser) {
                await Promise.all([
                    getRecords(),
                    getPatients(),
                    getMedicines(),
                    getAllUsers(),
                ]);
            }
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