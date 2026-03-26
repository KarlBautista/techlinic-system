import React, { useEffect, useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ScrollText, User, Pill, X, Clock, Tag, FileText, Hash, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react'
import useAuditTrail from '../store/useAuditTrailStore'

const ACTION_LABELS = {
  medicine_added: 'Added Medicine',
  medicine_updated: 'Updated Medicine',
  medicine_deleted: 'Deleted Medicine',
}

const ENTITY_ICONS = {
  medicine: Pill,
}

const ACTION_COLORS = {
  medicine_added: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  medicine_updated: 'bg-amber-50 text-amber-700 ring-amber-100',
  medicine_deleted: 'bg-red-50 text-red-700 ring-red-100',
}

const ROLE_COLORS = {
  DOCTOR: 'bg-blue-50 text-blue-700 ring-blue-100',
  NURSE: 'bg-[#b01c34]/10 text-[#b01c34] ring-[#b01c34]/20',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const ROWS_OPTIONS = [5, 10, 20, 50];

function formatDateTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const ActivityLog = () => {
  const { logs, isLoading, getAuditTrail } = useAuditTrail()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [entityFilter, setEntityFilter] = useState('ALL')
  const [selectedLog, setSelectedLog] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [roleOpen, setRoleOpen] = useState(false)
  const [entityOpen, setEntityOpen] = useState(false)
  const roleRef = useRef(null)
  const entityRef = useRef(null)

  useEffect(() => {
    getAuditTrail()
  }, [])

  const filteredLogs = useMemo(() => {
    return (logs || []).filter((log) => {
      const matchesSearch =
        log.description?.toLowerCase().includes(search.toLowerCase()) ||
        log.actor_name?.toLowerCase().includes(search.toLowerCase()) ||
        log.action?.toLowerCase().includes(search.toLowerCase())
      const matchesRole = roleFilter === 'ALL' || log.actor_role === roleFilter
      const matchesEntity = entityFilter === 'ALL' || log.entity_type === entityFilter
      return matchesSearch && matchesRole && matchesEntity
    })
  }, [logs, search, roleFilter, entityFilter])

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / rowsPerPage))
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1) }, [search, roleFilter, entityFilter])

  // Click outside to close dropdowns
  useEffect(() => {
    const handler = (e) => {
      if (roleRef.current && !roleRef.current.contains(e.target)) setRoleOpen(false)
      if (entityRef.current && !entityRef.current.contains(e.target)) setEntityOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {isLoading ? (
        <div className='w-full h-full flex flex-col gap-5 animate-pulse'>
          {/* Skeleton Header */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 rounded-xl bg-gray-200' />
              <div>
                <div className='h-6 w-44 bg-gray-200 rounded-lg' />
                <div className='h-4 w-24 bg-gray-100 rounded-lg mt-2' />
              </div>
            </div>
          </div>
          {/* Skeleton Filters */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='h-10 w-28 bg-gray-200 rounded-full' />
              <div className='h-10 w-36 bg-gray-200 rounded-full' />
            </div>
            <div className='flex items-center gap-2'>
              <div className='h-10 w-56 bg-gray-200 rounded-full' />
            </div>
          </div>
          {/* Skeleton Table */}
          <div className='bg-white rounded-xl ring-1 ring-gray-100 flex-1 flex flex-col overflow-hidden'>
            <div className='px-5 py-3 flex gap-4 border-b border-gray-100'>
              {[80, 100, 60, 80, 160].map((w, i) => (
                <div key={i} className='h-4 bg-gray-200 rounded' style={{ width: w }} />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className='px-5 py-4 flex items-center gap-4 border-b border-gray-50'>
                <div className='h-4 w-24 bg-gray-100 rounded' />
                <div className='flex items-center gap-2'>
                  <div className='w-7 h-7 rounded-full bg-gray-200' />
                  <div className='h-4 w-20 bg-gray-100 rounded' />
                </div>
                <div className='h-6 w-14 bg-gray-100 rounded-full' />
                <div className='h-6 w-16 bg-gray-100 rounded-full' />
                <div className='h-4 w-40 bg-gray-100 rounded' />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className='w-full h-full flex flex-col gap-5'
        >
          {/* ─── Page Header ─── */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 rounded-xl bg-crimson-50 flex items-center justify-center ring-1 ring-crimson-100'>
                <ScrollText className="w-6 h-6 text-crimson-600" />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-gray-800'>Activity Log</h1>
                <p className='text-sm text-gray-400 mt-0.5'>
                  Track all medicine actions performed by staff
                </p>
              </div>
            </div>
          </motion.div>

          {/* ─── Filters & Search ─── */}
          <motion.div variants={itemVariants} className='flex items-center justify-between gap-3 flex-wrap'>
            {/* Left: Filters */}
            <div className='flex items-center gap-2 flex-wrap'>
              {/* Role Dropdown */}
              <div ref={roleRef} className='relative'>
                <button
                  onClick={() => { setRoleOpen(!roleOpen); setEntityOpen(false); }}
                  className='inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white ring-1 ring-gray-200 text-xs font-medium text-gray-600 hover:ring-gray-300 transition-all cursor-pointer'
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>{roleFilter === 'ALL' ? 'All Roles' : roleFilter}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${roleOpen ? 'rotate-180' : ''}`} />
                </button>
                {roleOpen && (
                  <div className='absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 py-2 z-20'>
                    {[
                      { value: 'ALL', label: 'All Roles' },
                      { value: 'DOCTOR', label: 'Doctor' },
                      { value: 'NURSE', label: 'Nurse' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setRoleFilter(opt.value); setRoleOpen(false); }}
                        className='w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer'
                      >
                        <div className='flex items-center gap-3'>
                          <User className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm font-medium ${roleFilter === opt.value ? 'text-crimson-600' : 'text-gray-700'}`}>{opt.label}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${roleFilter === opt.value ? 'border-crimson-600 bg-crimson-600' : 'border-gray-300'}`}>
                          {roleFilter === opt.value && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Entity Dropdown */}
              <div ref={entityRef} className='relative'>
                <button
                  onClick={() => { setEntityOpen(!entityOpen); setRoleOpen(false); }}
                  className='inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white ring-1 ring-gray-200 text-xs font-medium text-gray-600 hover:ring-gray-300 transition-all cursor-pointer'
                >
                  <Pill className="w-4 h-4 text-gray-400" />
                  <span>{entityFilter === 'ALL' ? 'All Categories' : entityFilter}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${entityOpen ? 'rotate-180' : ''}`} />
                </button>
                {entityOpen && (
                  <div className='absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 py-2 z-20'>
                    {[
                      { value: 'ALL', label: 'All Categories' },
                      { value: 'medicine', label: 'Medicine' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setEntityFilter(opt.value); setEntityOpen(false); }}
                        className='w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer'
                      >
                        <div className='flex items-center gap-3'>
                          <Pill className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm font-medium ${entityFilter === opt.value ? 'text-crimson-600' : 'text-gray-700'}`}>{opt.label}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${entityFilter === opt.value ? 'border-crimson-600 bg-crimson-600' : 'border-gray-300'}`}>
                          {entityFilter === opt.value && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Search */}
            <div className='flex items-center gap-2'>
              <div className='flex items-center h-10 w-56 px-3 rounded-full bg-white ring-1 ring-gray-200 focus-within:ring-crimson-400 transition-all'>
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  className='outline-none w-full ml-2 text-xs text-gray-700 placeholder:text-gray-400 bg-transparent'
                  placeholder='Search activity...'
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* ─── Table Card ─── */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 flex-1 flex flex-col overflow-hidden"
          >
            <div className="overflow-auto flex-1">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50/95 backdrop-blur-sm">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                      Timestamp
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                      User
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                      Role
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                      Action
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log) => {
                      const Icon = ENTITY_ICONS[log.entity_type] || ScrollText
                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-crimson-50/40 cursor-pointer transition-colors group"
                          onClick={() => setSelectedLog(log)}
                        >
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-gray-500">
                              {formatDateTime(log.created_at)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#b01c34]/10 flex items-center justify-center">
                                <User className="w-3.5 h-3.5 text-[#b01c34]" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {log.actor_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${ROLE_COLORS[log.actor_role] || 'bg-gray-50 text-gray-600 ring-gray-100'
                                }`}
                            >
                              {log.actor_role}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${ACTION_COLORS[log.action] || 'bg-gray-50 text-gray-600 ring-gray-100'
                                }`}
                            >
                              <Icon className="w-3 h-3" />
                              {ACTION_LABELS[log.action] || log.action}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-sm text-gray-600">{log.description}</span>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center text-gray-400">
                          <div className="w-16 h-16 mb-3 rounded-2xl bg-gray-50 flex items-center justify-center">
                            <ScrollText className="w-7 h-7 text-gray-300" />
                          </div>
                          <p className="text-sm font-medium text-gray-500">No activity found</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Activity will appear here when actions are performed
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ─── Pagination Footer ─── */}
            {filteredLogs.length > 0 && (
              <div className='px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500'>
                <span>{filteredLogs.length} total entr{filteredLogs.length !== 1 ? 'ies' : 'y'}</span>
                <div className='flex items-center gap-1'>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className='w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer'
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {getPageNumbers().map((p, i) =>
                    p === '...' ? (
                      <span key={`dot-${i}`} className='w-8 h-8 flex items-center justify-center text-gray-400'>...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium transition-colors cursor-pointer ${currentPage === p ? 'bg-crimson-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className='w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer'
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <span className='mx-2 text-gray-300'>|</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className='h-8 px-2 rounded-lg bg-white ring-1 ring-gray-200 outline-none text-xs cursor-pointer'
                  >
                    {ROWS_OPTIONS.map(n => (
                      <option key={n} value={n}>{n} rows</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </motion.div>

          {/* ─── Detail Modal ─── */}
          {selectedLog && createPortal(
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center"
                onClick={() => setSelectedLog(null)}
              >
                {/* Dark backdrop (no blur) */}
                <div className="absolute inset-0 bg-black/50" />

                {/* Modal content */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = ENTITY_ICONS[selectedLog.entity_type] || ScrollText
                        return (
                          <div className="w-10 h-10 rounded-xl bg-[#b01c34]/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-[#b01c34]" />
                          </div>
                        )
                      })()}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Activity Details</h3>
                        <p className="text-xs text-gray-400">{selectedLog.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="px-6 py-5 space-y-4">
                    {/* Action badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ring-1 ${ACTION_COLORS[selectedLog.action] || 'bg-gray-50 text-gray-600 ring-gray-100'
                          }`}
                      >
                        {ACTION_LABELS[selectedLog.action] || selectedLog.action}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${ROLE_COLORS[selectedLog.actor_role] || 'bg-gray-50 text-gray-600 ring-gray-100'
                          }`}
                      >
                        {selectedLog.actor_role}
                      </span>
                    </div>

                    {/* Info rows */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Performed By</p>
                          <p className="text-sm font-medium text-gray-900">{selectedLog.actor_name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</p>
                          <p className="text-sm text-gray-700">{formatDateTime(selectedLog.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Tag className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Category</p>
                          <p className="text-sm text-gray-700 capitalize">{selectedLog.entity_type}</p>
                        </div>
                      </div>

                      {selectedLog.entity_id && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Hash className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Entity ID</p>
                            <p className="text-sm text-gray-700 font-mono">{selectedLog.entity_id}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Description</p>
                          <p className="text-sm text-gray-700">{selectedLog.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Additional Details</p>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                          {Object.entries(selectedLog.metadata).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="text-sm font-medium text-gray-800">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                      onClick={() => setSelectedLog(null)}
                      className="w-full h-10 rounded-lg bg-[#b01c34] text-white text-sm font-medium hover:bg-[#8f1629] transition-colors shadow-sm cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>,
            document.body
          )}
        </motion.div>
      )}
    </div>
  )
}

export default ActivityLog
