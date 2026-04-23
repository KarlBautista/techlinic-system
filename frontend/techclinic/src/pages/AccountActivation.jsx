import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { showToast } from '../components/Toast'
import supabase from '../config/supabaseClient'
import api from '../lib/api'
import TUP from '../assets/image/TUP.png'
import { validatePassword as sharedValidatePassword } from '../lib/validation'

const AccountActivation = () => {
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
        // Supabase auto-processes the invite token from the URL hash and fires SIGNED_IN
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
                setIsValidSession(true)
                setIsChecking(false)
            }
        })

        // Check if session already established (token already parsed)
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

    const validatePassword = (value) => sharedValidatePassword(value, { requireStrength: true })

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
            // 1. Set the password via Supabase
            const { error: updateError } = await supabase.auth.updateUser({ password })

            if (updateError) {
                showToast({ title: 'Error', message: updateError.message, type: 'error' })
                setIsLoading(false)
                return
            }

            // 2. Notify backend to mark invitation_status as ACTIVE
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (session?.access_token) {
                    await api.patch('/activate-account', {}, {
                        headers: { Authorization: `Bearer ${session.access_token}` }
                    })
                }
            } catch (_err) {
                // Non-critical — account password is set, status update is background
                console.warn('Could not update invitation status:', _err.message)
            }

            setIsSuccess(true)
            showToast({ title: 'Account Activated!', message: 'Your account is ready. Please log in with your new password.', type: 'success' })

            // Sign out so user logs in fresh with their new password
            await supabase.auth.signOut()
        } catch (err) {
            showToast({ title: 'Error', message: err.message, type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    if (isChecking) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-gray-50 to-crimson-50/30 flex items-center justify-center'>
                <div className='flex flex-col items-center gap-3'>
                    <div className='w-10 h-10 border-4 border-crimson-200 border-t-crimson-600 rounded-full animate-spin' />
                    <p className='text-sm text-gray-500'>Verifying your invitation link...</p>
                </div>
            </div>
        )
    }

    if (!isValidSession) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-gray-50 to-crimson-50/30 flex items-center justify-center p-4'>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 w-full max-w-md p-8 text-center'
                >
                    <div className='w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4'>
                        <AlertCircle className='w-7 h-7 text-red-500' />
                    </div>
                    <h2 className='text-xl font-bold text-gray-800 mb-2'>Invalid or Expired Link</h2>
                    <p className='text-sm text-gray-500 mb-6'>
                        This activation link is invalid or has already expired. Please ask your admin to resend the invitation.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className='px-6 py-2.5 rounded-xl bg-crimson-600 text-white text-sm font-medium hover:bg-crimson-700 transition-colors'
                    >
                        Go to Login
                    </button>
                </motion.div>
            </div>
        )
    }

    if (isSuccess) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-gray-50 to-crimson-50/30 flex items-center justify-center p-4'>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 w-full max-w-md p-8 text-center'
                >
                    <div className='w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5'>
                        <CheckCircle className='w-8 h-8 text-emerald-500' />
                    </div>
                    <h2 className='text-2xl font-bold text-gray-800 mb-2'>Account Activated!</h2>
                    <p className='text-sm text-gray-500 mb-6'>
                        Your TechClinic account is ready. Log in with your new password to get started.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className='px-6 py-3 rounded-xl bg-crimson-600 text-white text-sm font-semibold hover:bg-crimson-700 transition-colors shadow-sm'
                    >
                        Go to Login
                    </button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-crimson-50/30 flex items-center justify-center p-4'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className='bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 w-full max-w-md overflow-hidden'
            >
                {/* Header */}
                <div className='bg-gradient-to-r from-crimson-700 to-crimson-500 px-8 py-7 text-center'>
                    <img src={TUP} alt='TUP' className='w-12 h-12 mx-auto mb-3 object-contain' />
                    <h1 className='text-white text-xl font-bold tracking-wide'>TechClinic</h1>
                    <p className='text-crimson-100 text-xs mt-1'>TUP Health Services</p>
                </div>

                {/* Body */}
                <div className='px-8 py-8'>
                    <h2 className='text-xl font-bold text-gray-800 mb-1'>Activate Your Account</h2>
                    <p className='text-sm text-gray-500 mb-6'>
                        Welcome to TechClinic! Set a secure password to activate your account.
                    </p>

                    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                        {/* Password */}
                        <div className='flex flex-col gap-1.5'>
                            <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                                New Password <span className='text-red-500'>*</span>
                            </label>
                            <div className='relative'>
                                <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                                    <Lock className='w-4 h-4' />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={handlePasswordChange}
                                    onBlur={() => handleBlur('password')}
                                    placeholder='Create a strong password'
                                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border outline-none text-sm transition-all focus:ring-2 ${
                                        touched.password && errors.password
                                            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                                            : 'border-gray-200 focus:border-crimson-400 focus:ring-crimson-100'
                                    }`}
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(p => !p)}
                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer'
                                >
                                    {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                                </button>
                            </div>
                            {touched.password && errors.password && (
                                <p className='text-xs text-red-500'>{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className='flex flex-col gap-1.5'>
                            <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                                Confirm Password <span className='text-red-500'>*</span>
                            </label>
                            <div className='relative'>
                                <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
                                    <Lock className='w-4 h-4' />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    onBlur={() => handleBlur('confirmPassword')}
                                    placeholder='Re-enter your password'
                                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border outline-none text-sm transition-all focus:ring-2 ${
                                        touched.confirmPassword && errors.confirmPassword
                                            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                                            : 'border-gray-200 focus:border-crimson-400 focus:ring-crimson-100'
                                    }`}
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowConfirmPassword(p => !p)}
                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer'
                                >
                                    {showConfirmPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                                </button>
                            </div>
                            {touched.confirmPassword && errors.confirmPassword && (
                                <p className='text-xs text-red-500'>{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Requirements hint */}
                        <p className='text-xs text-gray-400'>
                            Password must be at least 6 characters with uppercase, lowercase, and a special character.
                        </p>

                        <button
                            type='submit'
                            disabled={isLoading}
                            className='mt-2 w-full py-3 rounded-xl bg-crimson-600 text-white text-sm font-semibold hover:bg-crimson-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                        >
                            {isLoading ? (
                                <>
                                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                    Activating...
                                </>
                            ) : 'Activate Account'}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}

export default AccountActivation
