import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

const ICONS = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: XCircle,
    info: Info,
}

const COLORS = {
    success: 'text-green-600',
    warning: 'text-amber-500',
    error: 'text-red-500',
    info: 'text-blue-500',
}

let toastId = 0
let addToastGlobal = null

// eslint-disable-next-line react-refresh/only-export-components
export function showToast({ title, message, type = 'success', duration = 3000, action }) {
    if (addToastGlobal) {
        addToastGlobal({ id: ++toastId, title, message, type, duration, action })
    }
}

function ToastItem({ toast, onDismiss }) {
    const Icon = ICONS[toast.type] || ICONS.info
    const color = COLORS[toast.type] || COLORS.info

    useEffect(() => {
        if (toast.duration > 0) {
            const timer = setTimeout(() => onDismiss(toast.id), toast.duration)
            return () => clearTimeout(timer)
        }
    }, [toast.id, toast.duration, onDismiss])

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[380px] bg-white dark:bg-[#161B26] rounded-xl shadow-lg ring-1 ring-gray-100 dark:ring-[#1F2A37] p-4 flex items-start gap-3"
        >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color}`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{toast.title}</p>
                {toast.message && (
                    <p className="text-sm text-gray-500 dark:text-[#94969C] mt-0.5 leading-snug">{toast.message}</p>
                )}
                {toast.action && (
                    <button
                        onClick={() => {
                            toast.action.onClick?.()
                            onDismiss(toast.id)
                        }}
                        className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white dark:text-white mt-1.5 inline-flex items-center gap-1 transition-colors"
                    >
                        {toast.action.label} <span aria-hidden>→</span>
                    </button>
                )}
            </div>
            <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-300 dark:text-[#94969C] hover:text-gray-500  transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-[#1F242F] dark:bg-[#1F242F]"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    )
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((toast) => {
        setToasts((prev) => [...prev, toast])
    }, [])

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    useEffect(() => {
        addToastGlobal = addToast
        return () => { addToastGlobal = null }
    }, [addToast])

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
                ))}
            </AnimatePresence>
        </div>
    )
}