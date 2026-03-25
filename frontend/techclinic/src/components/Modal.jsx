import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, AlertTriangle, CheckCircle2, X } from 'lucide-react'

const VARIANTS = {
    delete: {
        Icon: Trash2,
        iconBg: 'bg-red-50',
        iconColor: 'text-red-500',
        confirmBg: 'bg-red-500 hover:bg-red-600',
        confirmText: 'text-white',
    },
    warning: {
        Icon: AlertTriangle,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-500',
        confirmBg: 'bg-red-500 hover:bg-red-600',
        confirmText: 'text-white',
    },
    success: {
        Icon: CheckCircle2,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-500',
        confirmBg: 'bg-emerald-500 hover:bg-emerald-600',
        confirmText: 'text-white',
    },
    info: {
        Icon: AlertTriangle,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-500',
        confirmBg: 'bg-crimson-600 hover:bg-crimson-700',
        confirmText: 'text-white',
    },
}

let showModalGlobal = null

/**
 * Show a confirmation modal.
 * 
 * @param {Object} options
 * @param {'delete'|'warning'|'success'|'info'} options.type - Modal variant
 * @param {string} options.title - Modal title
 * @param {string} options.message - Description text
 * @param {string} [options.confirmLabel='Confirm'] - Confirm button text
 * @param {string} [options.cancelLabel='Cancel'] - Cancel button text
 * @param {boolean} [options.showCancel=true] - Show cancel button
 * @returns {Promise<boolean>} - Resolves true if confirmed, false if cancelled
 */
export function showModal({ type = 'warning', title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', showCancel = true }) {
    return new Promise((resolve) => {
        if (showModalGlobal) {
            showModalGlobal({ type, title, message, confirmLabel, cancelLabel, showCancel, resolve })
        } else {
            resolve(false)
        }
    })
}

function ModalContent({ modal, onClose }) {
    const variant = VARIANTS[modal.type] || VARIANTS.warning
    const IconComp = variant.Icon

    const handleConfirm = () => {
        modal.resolve(true)
        onClose()
    }

    const handleCancel = () => {
        modal.resolve(false)
        onClose()
    }

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') handleCancel()
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [])

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 bg-black/30 z-[9998]"
                onClick={handleCancel}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 12 }}
                    transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
                    className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close X button */}
                    {modal.showCancel && (
                        <button
                            onClick={handleCancel}
                            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className={`w-14 h-14 rounded-2xl ${variant.iconBg} flex items-center justify-center`}>
                            <IconComp className={`w-7 h-7 ${variant.iconColor}`} />
                        </div>
                    </div>

                    {/* Text */}
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800">{modal.title}</h3>
                        {modal.message && (
                            <p className="text-sm text-gray-500 mt-1">{modal.message}</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className={`flex gap-3 ${modal.showCancel ? '' : 'justify-center'}`}>
                        {modal.showCancel && (
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-xl ring-1 ring-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                {modal.cancelLabel}
                            </button>
                        )}
                        <button
                            onClick={handleConfirm}
                            className={`${modal.showCancel ? 'flex-1' : 'w-full'} px-4 py-2.5 text-sm font-medium rounded-xl ${variant.confirmBg} ${variant.confirmText} transition-colors shadow-sm`}
                        >
                            {modal.confirmLabel}
                        </button>
                    </div>
                </motion.div>
            </div>
        </>
    )
}

export default function ModalContainer() {
    const [modal, setModal] = useState(null)

    const show = useCallback((config) => {
        setModal(config)
    }, [])

    const close = useCallback(() => {
        setModal(null)
    }, [])

    useEffect(() => {
        showModalGlobal = show
        return () => { showModalGlobal = null }
    }, [show])

    return (
        <AnimatePresence>
            {modal && <ModalContent modal={modal} onClose={close} />}
        </AnimatePresence>
    )
}
