import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { showToast } from '../components/Toast'
import supabase from '../config/supabaseClient'
import TUP from '../assets/image/TUP.png'
import { validatePassword as sharedValidatePassword } from '../lib/validation'

const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isValidSession, setIsValidSession] = useState(false)
    const [isChecking, setIsChecking] = useState(true)
    const [errors, setErrors] = useState({ password: '', confirmPassword: '' })
    const [touched, setTouched] = useState({ password: false, confirmPassword: false })
    const navigate = useNavigate()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsValidSession(true)
                setIsChecking(false)
            }
        })

        // Also check if there's already a valid session (user may have arrived with token already processed)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                setIsValidSession(true)
            }
            setIsChecking(false)
        }
        checkSession()

        return () => subscription.unsubscribe()
    }, [])

    const validatePassword = (value) => {
        return sharedValidatePassword(value, { requireStrength: true })
    }

    const validateConfirmPassword = (value) => {
        if (!value) return 'Please confirm your password.'
        if (value !== password) return 'Passwords do not match.'
        return ''
    }

    const handlePasswordChange = (e) => {
        const val = e.target.value
        setPassword(val)
        if (touched.password) setErrors(prev => ({ ...prev, password: validatePassword(val) }))
        if (touched.confirmPassword && confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: val !== confirmPassword ? 'Passwords do not match.' : '' }))
        }
    }

    const handleConfirmPasswordChange = (e) => {
        const val = e.target.value
        setConfirmPassword(val)
        if (touched.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: val !== password ? 'Passwords do not match.' : validateConfirmPassword(val) }))
    }

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        if (field === 'password') setErrors(prev => ({ ...prev, password: validatePassword(password) }))
        if (field === 'confirmPassword') setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword) }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const passwordError = validatePassword(password)
        const confirmError = validateConfirmPassword(confirmPassword)
        setErrors({ password: passwordError, confirmPassword: confirmError })
        setTouched({ password: true, confirmPassword: true })

        if (passwordError || confirmError) return

        setIsLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({ password })

            if (error) {
                showToast({ title: 'Error', message: error.message, type: 'error' })
            } else {
                setIsSuccess(true)
                showToast({ title: 'Password Updated', message: 'Your password has been reset successfully.', type: 'success' })

                // Sign out so user logs in with new password
                await supabase.auth.signOut()
            }
        } catch (err) {
            showToast({ title: 'Error', message: err.message, type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    if (isChecking) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#fff7f7] via-[#ffffff] to-[#fffaf2]">
                <div className="w-6 h-6 border-2 border-crimson-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!isValidSession && !isChecking) {
        return (
            <div className="h-screen flex flex-col bg-gradient-to-br from-[#fff7f7] via-[#ffffff] to-[#fffaf2]">
                <div className="flex items-center px-6 md:px-10 py-4">
                    <div className="flex items-center gap-3">
                        <img src={TUP} alt="TUP" className="w-9 h-9" />
                        <span className="text-lg font-bold text-gray-800">TechClinic</span>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                    <div className="w-full max-w-md bg-white rounded-2xl ring-1 ring-gray-200 shadow-lg shadow-rose-100/30 p-8 text-center space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">Invalid or Expired Link</h2>
                        <p className="text-sm text-gray-500">This password reset link is invalid or has expired. Please request a new one.</p>
                        <button
                            onClick={() => navigate('/forgot-password')}
                            className="w-full py-3 rounded-xl bg-crimson-600 text-white text-sm font-semibold tracking-wider hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer"
                        >
                            REQUEST NEW LINK
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-[#fff7f7] via-[#ffffff] to-[#fffaf2]">
            {/* ─── Top Bar ─── */}
            <div className="flex items-center px-6 md:px-10 py-4">
                <div className="flex items-center gap-3">
                    <img src={TUP} alt="TUP" className="w-9 h-9" />
                    <span className="text-lg font-bold text-gray-800">TechClinic</span>
                </div>
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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {isSuccess ? 'Password Reset!' : 'Reset Your Password'}
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        {isSuccess
                            ? 'Your password has been updated. You can now login.'
                            : 'Enter your new password below.'}
                    </p>
                </motion.div>

                {/* ─── Card ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="w-full max-w-md bg-white rounded-2xl ring-1 ring-gray-200 shadow-lg shadow-rose-100/30 p-8"
                >
                    {isSuccess ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                                <CheckCircle className="w-7 h-7 text-green-500" />
                            </div>
                            <p className="text-sm text-gray-600">
                                Your password has been reset successfully. You can now log in with your new password.
                            </p>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/login')}
                                className="w-full py-3 rounded-xl bg-crimson-600 text-white text-sm font-semibold tracking-wider hover:bg-crimson-700 transition-colors shadow-sm cursor-pointer"
                            >
                                GO TO LOGIN
                            </motion.button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* New Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">New Password</label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        onBlur={() => handleBlur('password')}
                                        placeholder="Enter new password"
                                        maxLength={128}
                                        className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all ${
                                            touched.password && errors.password
                                                ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                                : 'border-gray-200 focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {touched.password && errors.password && (
                                    <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        onBlur={() => handleBlur('confirmPassword')}
                                        placeholder="Confirm new password"
                                        maxLength={128}
                                        className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all ${
                                            touched.confirmPassword && errors.confirmPassword
                                                ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                                : 'border-gray-200 focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {touched.confirmPassword && errors.confirmPassword && (
                                    <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 rounded-xl bg-crimson-600 text-white text-sm font-semibold tracking-wider hover:bg-crimson-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isLoading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        UPDATING...
                                    </span>
                                ) : 'RESET PASSWORD'}
                            </motion.button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export default ResetPassword
