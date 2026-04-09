import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'

// ════════════════════════════════════════════════════════
// ── App Layout ──
// Wraps all authenticated pages with sidebar + content area.
// Pages no longer need to import Navigation themselves.
// ════════════════════════════════════════════════════════

export default function AppLayout() {
    return (
        <div className="h-screen w-full flex flex-col sm:flex-row bg-background overflow-hidden print:overflow-visible">
            {/* ── Sidebar (desktop: left, mobile: fixed bottom via Sidebar) ── */}
            <div className="print:hidden">
                <Sidebar />
            </div>

            {/* ── Main Content Area ── */}
            <main className="flex-1 h-full overflow-auto scrollbar-mobile pt-14 pb-16 sm:pt-0 sm:pb-0">
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="h-full flex flex-col p-4 sm:p-6"
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    )
}
