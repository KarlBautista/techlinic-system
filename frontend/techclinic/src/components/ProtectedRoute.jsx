import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../store/useAuthStore';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
    const { authenticatedUser, isLoading, getUser } = useAuth();
    const location = useLocation();
    const [checking, setChecking] = useState(true);
    
    useEffect(() => {
        const verifyAuth = async () => {
            // Verify session is still valid
            await getUser();
            setChecking(false);
        };
        
        verifyAuth();
    }, []);
    
    // Show loading while checking auth or while app is loading
    if (isLoading || checking) {
        return (
            <div className='w-full h-screen flex items-center justify-center bg-gray-50'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#A12217] mx-auto mb-4'></div>
                    <p className='text-lg text-gray-700 font-medium'>Verifying authentication...</p>
                </div>
            </div>
        );
    }
    
    // If not authenticated, redirect to login
    if (!authenticatedUser) {
        console.log("🚫 Not authenticated, redirecting to login from:", location.pathname);
        return <Navigate to="/" replace state={{ from: location }} />;
    }
    
    // User is authenticated, render the protected content
    console.log("✅ User authenticated, rendering protected route:", location.pathname);
    return children;
};

export default ProtectedRoute;