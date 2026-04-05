import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../store/useAuthStore';
import { SessionSkeleton } from './PageLoader';

/**
 * ProtectedRoute - Wraps routes that require authentication and optionally specific roles.
 * 
 * Props:
 *   - children: The protected page component
 *   - allowedRoles: (optional) Array of roles allowed to access this route, e.g. ["DOCTOR"] or ["DOCTOR", "NURSE"]
 *                   If not provided, any authenticated user can access the route.
 * 
 * Examples:
 *   <ProtectedRoute><Dashboard /></ProtectedRoute>                              // Any authenticated user
 *   <ProtectedRoute allowedRoles={["DOCTOR"]}><PersonnelList /></ProtectedRoute> // Doctor only
 *   <ProtectedRoute allowedRoles={["NURSE"]}><NewPatient /></ProtectedRoute>     // Nurse only
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { authenticatedUser, userProfile, isLoading, isSessionVerified } = useAuth();
    const location = useLocation();
    
    // Still verifying session (App.jsx is running getUser) — show loader
    if (isLoading || !isSessionVerified) {
        return <SessionSkeleton />;
    }
    
    // Session verified but no user — redirect to login
    if (!authenticatedUser) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    
    // Role-based access check
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = userProfile?.role;
        
        // If profile hasn't loaded yet, show loader briefly
        if (!userProfile) {
            return <SessionSkeleton />;
        }
        
        // If user's role is not in the allowed list, redirect to their home with a message
        if (!userRole || !allowedRoles.includes(userRole)) {
            const homePath = userRole === 'ADMIN' ? '/admin-dashboard' : '/dashboard';
            return <Navigate to={homePath} replace state={{ 
                accessDenied: true, 
                message: `This page requires ${allowedRoles.join(' or ')} access.` 
            }} />;
        }
    }
    
    // User is authenticated and has the right role — render the protected content
    return children;
};

export default ProtectedRoute;