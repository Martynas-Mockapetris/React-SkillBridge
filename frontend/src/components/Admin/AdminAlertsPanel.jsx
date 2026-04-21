import { motion } from 'framer-motion'
import { FaExclamationTriangle, FaShieldAlt, FaUserLock, FaUserClock, FaProjectDiagram, FaCheckCircle, FaKey, FaArrowRight } from 'react-icons/fa'

const severityStyles = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
}

const HealthCard = ({ label, value, icon, actionLabel, onAction }) => (
  <div className='rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4'>
    <div className='flex items-center justify-between'>
      <p className='text-sm text-gray-500 dark:text-gray-400'>{label}</p>
      <span className='text-accent'>{icon}</span>
    </div>
    <p className='text-2xl font-bold text-gray-900 dark:text-white mt-2'>{value}</p>
    {actionLabel && onAction && (
      <button type='button' onClick={onAction} className='mt-3 inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors'>
        <span>{actionLabel}</span>
        <FaArrowRight className='w-3 h-3' />
      </button>
    )}
  </div>
)

const getAlertAction = (alertId, onOpenSection) => {
  if (!onOpenSection) return null

  if (alertId === 'locked-users') {
    return {
      label: 'Review locked users',
      onClick: () => onOpenSection('users', { status: 'locked' })
    }
  }

  if (alertId === 'inactive-users') {
    return {
      label: 'Review inactive users',
      onClick: () => onOpenSection('users', { status: 'inactive' })
    }
  }

  if (alertId === 'unverified-users') {
    return {
      label: 'Review unverified users',
      onClick: () => onOpenSection('users', { verification: 'unverified' })
    }
  }

  if (alertId === 'password-reset-required-users') {
    return {
      label: 'Review reset-required users',
      onClick: () => onOpenSection('users', { passwordResetRequired: 'true' })
    }
  }

  if (alertId === 'stalled-projects') {
    return {
      label: 'Review stalled projects',
      onClick: () => onOpenSection('projects', { stalled: 'true' })
    }
  }

  return null
}

const AdminAlertsPanel = ({ isLoading, alertSummary, alerts, healthSignals, onOpenSection }) => {
  if (isLoading) {
    return (
      <div className='mt-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6'>
        <div className='h-40 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg' />
      </div>
    )
  }

  const summary = alertSummary || { total: 0, critical: 0, warning: 0, info: 0 }
  const list = Array.isArray(alerts) ? alerts : []
  const signals = healthSignals || {
    lockedUsers: 0,
    inactiveUsers: 0,
    unverifiedUsers: 0,
    passwordResetRequiredUsers: 0,
    stalledProjects: 0
  }

  return (
    <motion.section className='mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6' initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <div className='xl:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6'>
        <div className='flex flex-col gap-3 mb-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <FaExclamationTriangle className='text-amber-500' />
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Action Queue</h3>
            </div>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Priority admin issues that can be reviewed directly from the dashboard.</p>
          </div>
          <div className='flex items-center gap-2 text-xs'>
            <span className='px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'>Total: {summary.total}</span>
            <span className='px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'>Critical: {summary.critical}</span>
            <span className='px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'>Warning: {summary.warning}</span>
          </div>
        </div>

        {!list.length ? (
          <div className='rounded-lg border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/20 p-4 text-green-800 dark:text-green-300 text-sm'>No active alerts. System health looks stable.</div>
        ) : (
          <div className='space-y-3'>
            {list.map((alert) => {
              const action = getAlertAction(alert.id, onOpenSection)

              return (
                <div key={alert.id} className='rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/40'>
                  <div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between'>
                    <div>
                      <p className='font-semibold text-gray-900 dark:text-white'>{alert.title}</p>
                      <p className='text-sm text-gray-600 dark:text-gray-300 mt-1'>{alert.message}</p>
                    </div>

                    <div className='flex items-center gap-2'>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityStyles[alert.severity] || severityStyles.info}`}>{alert.severity || 'info'}</span>
                      {action && (
                        <button
                          type='button'
                          onClick={action.onClick}
                          className='inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-medium text-accent hover:bg-accent/15 transition-colors'>
                          <span>{action.label}</span>
                          <FaArrowRight className='w-3 h-3' />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className='rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <FaShieldAlt className='text-accent' />
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Health Signals</h3>
        </div>

        <div className='space-y-3'>
          <HealthCard label='Locked Users' value={signals.lockedUsers || 0} icon={<FaUserLock />} actionLabel='Open locked users' onAction={() => onOpenSection?.('users', { status: 'locked' })} />
          <HealthCard label='Inactive Users (14+ d)' value={signals.inactiveUsers || 0} icon={<FaUserClock />} actionLabel='Open inactive users' onAction={() => onOpenSection?.('users', { status: 'inactive' })} />
          <HealthCard
            label='Unverified Users'
            value={signals.unverifiedUsers || 0}
            icon={<FaCheckCircle />}
            actionLabel='Open unverified users'
            onAction={() => onOpenSection?.('users', { verification: 'unverified' })}
          />
          <HealthCard
            label='Password Reset Required'
            value={signals.passwordResetRequiredUsers || 0}
            icon={<FaKey />}
            actionLabel='Open reset-required users'
            onAction={() => onOpenSection?.('users', { passwordResetRequired: 'true' })}
          />
          <HealthCard
            label='Stalled Projects (14+ d)'
            value={signals.stalledProjects || 0}
            icon={<FaProjectDiagram />}
            actionLabel='Open stalled projects'
            onAction={() => onOpenSection?.('projects', { stalled: 'true' })}
          />
        </div>
      </div>
    </motion.section>
  )
}

export default AdminAlertsPanel
