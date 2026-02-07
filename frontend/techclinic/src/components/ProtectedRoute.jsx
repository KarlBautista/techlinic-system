import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../store/useAuthStore';
import { PageLoader } from './PageLoader';

/**
 * ProtectedRoute - Wraps routes that require authentication.
 * Session verification happens once in App.jsx via getUser().
 * This component just checks the verified state.
 */
const ProtectedRoute = ({ children }) => {
    const { authenticatedUser, isLoading, isSessionVerified } = useAuth();
    const location = useLocation();
    
    // Still verifying session (App.jsx is running getUser) — show loader
    if (isLoading || !isSessionVerified) {
        return (
            <div className='w-full h-screen flex items-center justify-center bg-gray-50'>
                <PageLoader message="Verifying session..." />
            </div>
        );
    }
    
    // Session verified but no user — redirect to login
    if (!authenticatedUser) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    
    // User is authenticated, render the protected content
    return children;
};

export default ProtectedRoute;