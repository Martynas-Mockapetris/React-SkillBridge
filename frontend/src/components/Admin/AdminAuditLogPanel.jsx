import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaHistory, FaSearch } from 'react-icons/fa'
import PaginationControls from '../shared/PaginationControls'
import { getAdminAuditLogs } from '../../services/userService'

const formatActionLabel = (value = '') =>
  value
    .split('.')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ''))
    .join(' ')

const formatTargetTypeLabel = (value = '') =>
  value
    .split('_')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ''))
    .join(' ')

const formatActorName = (actor) => {
  if (!actor) return 'Unknown admin'
  const fullName = `${actor.firstName || ''} ${actor.lastName || ''}`.trim()
  return fullName || actor.email || 'Unknown admin'
}

const formatChangeValue = (value) => {
  if (value === null || value === undefined || value === '') return 'Empty'
  if (Array.isArray(value)) return value.join(', ') || 'Empty'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const severityToneByAction = {
  'user.deleted': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'project.cancelled': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'project.locked': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'blog.deleted': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
}

const AdminAuditLogPanel = () => {
  const [logs, setLogs] = useState([])
  const [filterOptions, setFilterOptions] = useState({ actions: [], targetTypes: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedAction, setSelectedAction] = useState('')
  const [selectedTargetType, setSelectedTargetType] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, selectedAction, selectedTargetType])

  useEffect(() => {
    fetchAuditLogs()
  }, [currentPage, search, selectedAction, selectedTargetType])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      setError('')

      const data = await getAdminAuditLogs({
        page: currentPage,
        limit: 10,
        search,
        action: selectedAction,
        targetType: selectedTargetType
      })

      setLogs(Array.isArray(data?.logs) ? data.logs : [])
      setTotalPages(data?.pages || 1)
      setTotal(data?.total || 0)
      setFilterOptions({
        actions: Array.isArray(data?.filterOptions?.actions) ? data.filterOptions.actions : [],
        targetTypes: Array.isArray(data?.filterOptions?.targetTypes) ? data.filterOptions.targetTypes : []
      })
    } catch (err) {
      console.error('Error fetching audit logs:', err)
      setError(err.response?.data?.message || 'Failed to load audit logs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.section className='mt-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6' initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg bg-accent/10 p-3 text-accent'>
            <FaHistory />
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Admin Audit Log</h3>
            <p className='text-sm text-gray-500 dark:text-gray-400'>Recent admin actions across users, projects, and blog content.</p>
          </div>
        </div>

        <div className='text-sm text-gray-500 dark:text-gray-400'>
          Total entries: <span className='font-semibold text-gray-900 dark:text-white'>{total}</span>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search summary or target...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-900 dark:text-white'
          />
          <FaSearch className='absolute left-3 top-3 text-gray-400' />
        </div>

        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className='w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-900 dark:text-white'>
          <option value=''>All Actions</option>
          {filterOptions.actions.map((action) => (
            <option key={action} value={action}>
              {formatActionLabel(action)}
            </option>
          ))}
        </select>

        <select
          value={selectedTargetType}
          onChange={(e) => setSelectedTargetType(e.target.value)}
          className='w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-900 dark:text-white'>
          <option value=''>All Targets</option>
          {filterOptions.targetTypes.map((targetType) => (
            <option key={targetType} value={targetType}>
              {formatTargetTypeLabel(targetType)}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className='rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-6 text-sm text-gray-500 dark:text-gray-300'>Loading audit log...</div>}

      {error && <div className='rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-300'>{error}</div>}

      {!loading && !error && logs.length === 0 && (
        <div className='rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-6 text-sm text-gray-500 dark:text-gray-300'>No audit log entries found for the current filters.</div>
      )}

      {!loading && !error && logs.length > 0 && (
        <div className='space-y-4'>
          {logs.map((log) => (
            <div key={log._id} className='rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4'>
              <div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between'>
                <div className='space-y-2'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityToneByAction[log.action] || 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                      {formatActionLabel(log.action)}
                    </span>
                    <span className='px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'>
                      {formatTargetTypeLabel(log.targetType)}
                    </span>
                    <span className='text-xs text-gray-500 dark:text-gray-400'>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>

                  <div>
                    <p className='font-semibold text-gray-900 dark:text-white'>{log.summary}</p>
                    <p className='text-sm text-gray-600 dark:text-gray-300 mt-1'>
                      By {formatActorName(log.actor)}
                      {log.targetLabel ? ` on ${log.targetLabel}` : ''}
                    </p>
                  </div>

                  {Array.isArray(log.changes) && log.changes.length > 0 && (
                    <div className='rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3'>
                      <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2'>Field Changes</p>
                      <div className='space-y-2'>
                        {log.changes.map((change, index) => (
                          <div key={`${log._id}-${change.field}-${index}`} className='text-sm text-gray-700 dark:text-gray-300'>
                            <span className='font-medium text-gray-900 dark:text-white'>{change.field}:</span> {formatChangeValue(change.before)} {' -> '} {formatChangeValue(change.after)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className='text-xs text-gray-500 dark:text-gray-400 lg:text-right'>
                  <div>Actor Role: {formatTargetTypeLabel(log.actorRole || 'unknown')}</div>
                  {log.context?.ipAddress && <div className='mt-1'>IP: {log.context.ipAddress}</div>}
                </div>
              </div>
            </div>
          ))}

          <PaginationControls currentPage={currentPage} totalPages={totalPages} onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))} onNext={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} label={`Page ${currentPage} of ${totalPages}`} />
        </div>
      )}
    </motion.section>
  )
}

export default AdminAuditLogPanel