import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import useAuth from '../store/useAuthStore';
import TUP from "../assets/image/TUP.png"
import School from "../assets/image/school.jpg"
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { signInWithGoogle, authenticatedUser, signIn, isSessionVerified } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
   
    const from = location.state?.from?.pathname || "/dashboard";
    
    useEffect(() => {
        if (isSessionVerified && authenticatedUser) {
            console.log("✅ User has valid session, redirecting to:", from);
            navigate(from, { replace: true });
        }
    }, [authenticatedUser, isSessionVerified, navigate, from]);

    const handleSignInWithGoogle = async () => {
        try {
            setIsLoading(true);
            console.log("🔐 Attempting Google sign-in...");
            const response = await signInWithGoogle();
            if (response.error) {
                console.error(`Error signing in with Google: ${response.error}`);
                alert(`Error signing in with Google: ${response.error}`);
            }
            
        } catch (err) {
            console.error("Google sign-in error:", err.message);
            alert(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSignin = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            alert("Please enter both email and password");
            return;
        }
        
        setIsLoading(true);
        console.log("🔐 Attempting email/password sign-in for:", email);
        
        try {
            const response = await signIn(email, password);
            
            if (response.error) {
                console.error(`Error signing in:`, response.error);
                alert(`Error signing in: ${response.error.message || response.error}`);
            } else {
                console.log("✅ Sign-in successful! Navigating to:", from);
                navigate(from, { replace: true });
            }
        } catch (err) {
            console.error("Sign-in error:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <div className='flex h-screen w-full'>
            {/* ─── Left: Login Form ─── */}
            <div className='flex flex-1 items-center justify-center px-6 py-12 lg:px-8'>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className='w-full max-w-md'
                >
                    {/* Logo / Branding */}
                    <div className='flex items-center gap-4 mb-10'>
                        <img src={TUP} alt="TUP" className='h-14 md:h-16 object-contain' />
                        <div>
                            <p className='text-crimson-600 text-2xl md:text-3xl font-bold tracking-wider'>Techclinic</p>
                            <p className='text-crimson-800/60 text-xs md:text-sm'>Health Record and Analytics System</p>
                        </div>
                    </div>

                    {/* Welcome Text */}
                    <div className='mb-8'>
                        <h1 className='text-2xl font-bold text-gray-800'>Welcome back</h1>
                        <p className='text-sm text-gray-500 mt-1'>Sign in to your clinic account to continue</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSignin} className='space-y-5'>
                        {/* Email Field */}
                        <div className='space-y-1.5'>
                            <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Email Address</label>
                            <div className='relative'>
                                <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400'>
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@tup.edu.ph"
                                    className='w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all'
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className='space-y-1.5'>
                            <label className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Password</label>
                            <div className='relative'>
                                <div className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400'>
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className='w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 transition-all'
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className='w-full py-3 rounded-xl bg-crimson-600 text-white text-sm font-semibold tracking-wider hover:bg-crimson-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isLoading ? (
                                <span className='inline-flex items-center gap-2'>
                                    <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                    SIGNING IN...
                                </span>
                            ) : 'LOGIN'}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className='flex items-center my-6'>
                        <div className='flex-1 h-px bg-gray-200' />
                        <span className='px-3 text-xs text-gray-400'>or</span>
                        <div className='flex-1 h-px bg-gray-200' />
                    </div>

                    {/* Google Sign In (placeholder kept) */}
                    <div className='text-center'>
                        <p className='text-xs text-gray-400'>Clinic personnel access only</p>
                    </div>
                </motion.div>
            </div>

            {/* ─── Right: Image Panel ─── */}
            <div className='hidden lg:block lg:w-[50%] relative'>
                <img src={School} alt="TUP Campus" className='h-full w-full object-cover' />
                <div className='absolute inset-0 bg-linear-to-l from-transparent to-crimson-900/20' />
            </div>
        </div>
    )
}

export default Login