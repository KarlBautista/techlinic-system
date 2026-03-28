import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { showToast } from '../components/Toast'
import supabase from '../config/supabaseClient'
import TUP from '../assets/image/TUP.png'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const [error, setError] = useState('')
    const [touched, setTouched] = useState(false)
    const navigate = useNavigate()

    const validateEmail = (value) => {
        if (!value.trim()) return 'Email is required.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.'
        return ''
    }

    const handleEmailChange = (e) => {
        const val = e.target.value
        setEmail(val)
        if (touched) setError(validateEmail(val))
    }

    const handleBlur = () => {
        setTouched(true)
        setError(validateEmail(email))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const emailError = validateEmail(email)
        setError(emailError)
        setTouched(true)

        if (emailError) return

        setIsLoading(true)

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (resetError) {
                showToast({ title: 'Error', message: resetError.message, type: 'error' })
            } else {
                setIsSent(true)
                showToast({ title: 'Email Sent', message: 'Check your inbox for the password reset link.', type: 'success' })
            }
        } catch (err) {
            showToast({ title: 'Error', message: err.message, type: 'error' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-[#fff7f7] via-[#ffffff] to-[#fffaf2]">
            {/* ─── Top Bar ─── */}
            <div className="flex items-center justify-between px-6 md:px-10 py-4">
                <div className="flex items-center gap-3">
                    <img src={TUP} alt="TUP" className="w-9 h-9" />
                    <span className="text-lg font-bold text-gray-800">TechClinic</span>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="text-sm text-gray-500 hover:text-crimson-600 transition-colors cursor-pointer flex items-center gap-1"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Forgot Password</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        {isSent
                            ? "We've sent a password reset link to your email."
                            : "Enter your email address and we'll send you a reset link."}
                    </p>
                </motion.div>

                {/* ─── Card ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="w-full max-w-md bg-white rounded-2xl ring-1 ring-gray-200 shadow-lg shadow-rose-100/30 p-8"
                >
                    {isSent ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                                <Mail className="w-7 h-7 text-green-500" />
                            </div>
                            <p className="text-sm text-gray-600">
                                A reset link has been sent to <span className="font-semibold text-gray-800">{email}</span>.
                                Check your inbox and click the link to reset your password.
                            </p>
                            <p className="text-xs text-gray-400">
                                Didn't receive it? Check your spam folder or try again.
                            </p>
                            <button
                                onClick={() => { setIsSent(false); setEmail(''); setTouched(false); setError(''); }}
                                className="text-sm text-crimson-600 font-semibold hover:underline cursor-pointer"
                            >
                                Send again
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        onBlur={handleBlur}
                                        placeholder="you@tup.edu.ph"
                                        maxLength={254}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all ${
                                            touched && error
                                                ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                                : 'border-gray-200 focus:border-crimson-400 focus:ring-2 focus:ring-crimson-100'
                                        }`}
                                    />
                                </div>
                                {touched && error && (
                                    <p className="text-xs text-red-500 mt-1">{error}</p>
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
                                        SENDING...
                                    </span>
                                ) : 'SEND RESET LINK'}
                            </motion.button>
                        </form>
                    )}

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm text-gray-500 hover:text-crimson-600 transition-colors cursor-pointer"
                        >
                            Remember your password?&nbsp;
                            <span className="font-semibold text-crimson-600 hover:underline">Login</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default ForgotPassword
