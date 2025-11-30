import { useEffect, useState } from 'react'
import './App.css'
import { RouterProvider } from 'react-router-dom'
import router from "./router/router"
import useAuth from './store/useAuthStore'
import useData from './store/useDataStore'
import useMedicine from './store/useMedicineStore'

function App() {
    const { authListener, getUser } = useAuth();
    const { getRecords, getPatients } = useData();
    const { getMedicines } = useMedicine();
    const [isInitialized, setIsInitialized] = useState(false);
    
    useEffect(() => {
        let unsubscribe;
        
        const initialize = async () => {
            console.log("🚀 App initializing...");
            
            // Set up auth listener FIRST
            unsubscribe = authListener();
            
            // Then check for existing session
            await getUser();
            
            // Load other data
            await Promise.all([
                getRecords(),
                getPatients(),
                getMedicines()
            ]);
            
            setIsInitialized(true);
            console.log("✅ App initialized");
        };
        
        initialize();
        
        return () => {
            if (unsubscribe && typeof unsubscribe === "function") {
                console.log("🧹 Cleaning up auth listener");
                unsubscribe();
            }
        };
    }, []); // Run only once on mount
    
    return (
        <div className='w-full h-screen'>
            <RouterProvider router={router}/>
        </div>
    );
}

export default App