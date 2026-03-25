import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ScrollText, User, Pill, Filter, X, Clock, Tag, FileText, Hash } from 'lucide-react'
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

  useEffect(() => {
    getAuditTrail()
  }, [])

  const filteredLogs = (logs || []).filter((log) => {
    const matchesSearch =
      log.description?.toLowerCase().includes(search.toLowerCase()) ||
      log.actor_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || log.actor_role === roleFilter
    const matchesEntity = entityFilter === 'ALL' || log.entity_type === entityFilter
    return matchesSearch && matchesRole && matchesEntity
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-gray-800">Activity Log</h1>
        <p className="text-sm text-gray-500 mt-1">
          Track all medicine actions performed by Doctors and Nurses
        </p>
      </motion.div>

      {/* ─── Search & Filters ─── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex items-center gap-3 flex-wrap"
      >
        <div className="flex items-center flex-1 min-w-[200px] max-w-md h-10 px-3 rounded-xl bg-white ring-1 ring-gray-200 focus-within:ring-crimson-400 focus-within:ring-2 transition-all">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            className="outline-none w-full ml-2 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
            placeholder="Search activity..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-1 h-10 px-2 rounded-xl bg-white ring-1 ring-gray-200">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-sm text-gray-700 bg-transparent outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="DOCTOR">Doctor</option>
            <option value="NURSE">Nurse</option>
          </select>
        </div>

        {/* Entity Filter */}
        <div className="flex items-center gap-1 h-10 px-2 rounded-xl bg-white ring-1 ring-gray-200">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-sm text-gray-700 bg-transparent outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="medicine">Medicine</option>
          </select>
        </div>

        {filteredLogs && (
          <span className="text-xs text-gray-400 font-medium ml-auto">
            {filteredLogs.length} entr{filteredLogs.length !== 1 ? 'ies' : 'y'}
          </span>
        )}
      </motion.div>

      {/* ─── Table Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 flex-1 flex flex-col overflow-hidden"
      >
        {isLoading ? (
          <div className="animate-pulse">
            <div className="px-5 py-3 flex gap-4 border-b border-gray-100">
              {[80, 100, 60, 80, 160].map((w, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: w }} />
              ))}
            </div>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4 border-b border-gray-50">
                <div className="h-4 w-24 bg-gray-100 rounded" />
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gray-200" />
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                </div>
                <div className="h-6 w-14 bg-gray-100 rounded-full" />
                <div className="h-6 w-16 bg-gray-100 rounded-full" />
                <div className="h-4 w-40 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-sm">
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
                {filteredLogs && filteredLogs.length > 0 ? (
                  filteredLogs.map((log, idx) => {
                    const Icon = ENTITY_ICONS[log.entity_type] || ScrollText
                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.015, duration: 0.25 }}
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
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${
                              ROLE_COLORS[log.actor_role] || 'bg-gray-50 text-gray-600 ring-gray-100'
                            }`}
                          >
                            {log.actor_role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ${
                              ACTION_COLORS[log.action] || 'bg-gray-50 text-gray-600 ring-gray-100'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            {ACTION_LABELS[log.action] || log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm text-gray-600">{log.description}</span>
                        </td>
                      </motion.tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center text-gray-400">
                        <div className="w-16 h-16 mb-3 rounded-2xl bg-[#b01c34]/10 flex items-center justify-center">
                          <ScrollText className="w-7 h-7 text-[#b01c34]/40" />
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ring-1 ${
                      ACTION_COLORS[selectedLog.action] || 'bg-gray-50 text-gray-600 ring-gray-100'
                    }`}
                  >
                    {ACTION_LABELS[selectedLog.action] || selectedLog.action}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ${
                      ROLE_COLORS[selectedLog.actor_role] || 'bg-gray-50 text-gray-600 ring-gray-100'
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
  )
}

export default ActivityLog
