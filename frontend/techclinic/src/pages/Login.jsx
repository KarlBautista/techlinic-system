import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import useAuth from '../store/useAuthStore';
import TUP from "../assets/image/TUP.png"
import { useNavigate, useLocation } from 'react-router-dom';
import { showToast } from '../components/Toast'

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [touched, setTouched] = useState({ email: false, password: false });
    const { signInWithGoogle, authenticatedUser, signIn, isSessionVerified } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
   
    const from = location.state?.from?.pathname || "/dashboard";

    // Apply theme: respect saved preference, default to light
    useEffect(() => {
        const saved = localStorage.getItem('tc-theme');
        if (saved === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, []);
    
    useEffect(() => {
        if (isSessionVerified && authenticatedUser) {
            console.log("✅ User has valid session, redirecting to:", from);
            navigate(from, { replace: true });
        }
    }, [authenticatedUser, isSessionVerified, navigate, from]);

    const validateEmail = (value) => {
        if (!value.trim()) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.';
        return '';
    };

    const validatePassword = (value) => {
        if (!value) return 'Password is required.';
        if (value.length < 6) return 'Password must be at least 6 characters.';
        return '';
    };

    const handleEmailChange = (e) => {
        const val = e.target.value;
        setEmail(val);
        if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(val) }));
    };

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setPassword(val);
        if (touched.password) setErrors(prev => ({ ...prev, password: validatePassword(val) }));
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        if (field === 'email') setErrors(prev => ({ ...prev, email: validateEmail(email) }));
        if (field === 'password') setErrors(prev => ({ ...prev, password: validatePassword(password) }));
    };

    const handleSignInWithGoogle = async () => {
        try {
            setIsLoading(true);
            console.log("🔐 Attempting Google sign-in...");
            const response = await signInWithGoogle();
            if (response.error) {
                console.error(`Error signing in with Google: ${response.error}`);
                showToast({ title: 'Error', message: `Error signing in with Google: ${response.error}`, type: 'error' });
            }
            
        } catch (err) {
            console.error("Google sign-in error:", err.message);
            showToast({ title: 'Error', message: err.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }

    const handleSignin = async (e) => {
        e.preventDefault();

        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);
        setErrors({ email: emailError, password: passwordError });
        setTouched({ email: true, password: true });

        if (emailError || passwordError) {
            showToast({ title: 'Validation Error', message: emailError || passwordError, type: 'warning' });
            return;
        }
        
        setIsLoading(true);
        console.log("🔐 Attempting email/password sign-in for:", email);
        
        try {
            const response = await signIn(email, password);
            
            if (response.error) {
                console.error(`Error signing in:`, response.error);
                showToast({ title: 'Sign In Error', message: response.error.message || String(response.error), type: 'error' });
            } else {
                console.log("✅ Sign-in successful! Navigating to:", from);
                navigate(from, { replace: true });
            }
        } catch (err) {
            console.error("Sign-in error:", err);
            showToast({ title: 'Error', message: err.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <div className="h-screen flex flex-col bg-linear-to-br from-rose-50/30 via-white to-amber-50/20">
            {/* ─── Top Bar ─── */}
            <div className="flex items-center justify-between px-6 md:px-10 py-4">
                <div className="flex items-center gap-3">
                    <img src={TUP} alt="TUP" className="w-9 h-9" />
                    <span className="text-lg font-bold text-gray-800 dark:text-white">TechClinic</span>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="text-sm text-gray-500 dark:text-[#94969C] hover:text-crimson-600 transition-colors cursor-pointer"
                >
                    New Patient?&nbsp;
                    <span className="font-semibold text-crimson-600 hover:underline">Register</span>
                </button>
            </div>

            {/* ─── Content ─── */}
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-center mb-6"
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                    <p className="text-gray-500 dark:text-[#94969C] mt-2 text-sm">Sign in to your clinic account to continue.</p>
                </motion.div>

                {/* ─── Login Card ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="w-full max-w-md bg-white dark:bg-[#161B26] rounded-2xl ring-1 ring-gray-200/60 shadow-sm p-8"
                >
                    <form onSubmit={handleSignin} className="space-y-5">
                        {/* Email Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider">Email Address</label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#94969C]">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={handleEmailChange}
                                    onBlur={() => handleBlur('email')}
                                    placeholder="you@tup.edu.ph"
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#94969C] outline-none transition-all ${
                                        touched.email && errors.email
                                            ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                            : 'border-gray-200 dark:border-[#1F2A37] focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741]'
                                    }`}
                                />
                            </div>
                            {touched.email && errors.email && (
                                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-500 dark:text-[#94969C] uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#94969C]">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    onBlur={() => handleBlur('password')}
                                    placeholder="Enter your password"
                                    className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#94969C] outline-none transition-all ${
                                        touched.password && errors.password
                                            ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                            : 'border-gray-200 dark:border-[#1F2A37] focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100 dark:ring-[#333741]'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#94969C] hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {touched.password && errors.password && (
                                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl bg-crimson-600 text-white text-sm font-semibold tracking-wider hover:bg-crimson-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isLoading ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    SIGNING IN...
                                </span>
                            ) : 'LOGIN'}
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <p className="text-xs text-gray-400 dark:text-[#94969C]">Clinic personnel access only</p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Login