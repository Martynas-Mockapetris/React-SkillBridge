import { useState, useEffect } from 'react'
import { getAdminDashboardStats } from '../../services/userService'
import AdminAlertsPanel from './AdminAlertsPanel'
import AdminAuditLogPanel from './AdminAuditLogPanel'
import StatCard from './StatCard'
import { FaUsers, FaProjectDiagram, FaCheckCircle, FaMoneyBillWave, FaUserCheck, FaDollarSign, FaBullseye, FaLayerGroup, FaChartLine } from 'react-icons/fa'

const defaultStats = {
  totalUsers: 0,
  activeProjects: 0,
  completedProjects: 0,
  revenue: 0,
  comparisons: {
    users: 0,
    activeProjects: 0,
    completedProjects: 0,
    revenue: 0
  },
  alertSummary: {
    total: 0,
    critical: 0,
    warning: 0,
    info: 0
  },
  alerts: [],
  healthSignals: {
    lockedUsers: 0,
    inactiveUsers: 0,
    stalledProjects: 0
  },
  kpis: {
    activeUserRate: 0,
    avgCompletedProjectValue: 0,
    completionRate: 0,
    newProjectsLast30: 0,
    newProjectsTrend: 0
  }
}

const AdminStats = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(defaultStats)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    setIsLoading(true)
    setError('')

    try {
      const data = await getAdminDashboardStats()

      setStats({
        ...defaultStats,
        ...data,
        comparisons: {
          ...defaultStats.comparisons,
          ...(data?.comparisons || {})
        },
        alertSummary: {
          ...defaultStats.alertSummary,
          ...(data?.alertSummary || {})
        },
        healthSignals: {
          ...defaultStats.healthSignals,
          ...(data?.healthSignals || {})
        },
        kpis: {
          ...defaultStats.kpis,
          ...(data?.kpis || {})
        },
        alerts: Array.isArray(data?.alerts) ? data.alerts : []
      })
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError(err.response?.data?.message || 'Failed to load dashboard stats.')
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: isLoading ? '...' : stats.totalUsers.toLocaleString(),
      icon: <FaUsers />,
      trend: stats.comparisons.users
    },
    {
      title: 'Active Projects',
      value: isLoading ? '...' : stats.activeProjects.toLocaleString(),
      icon: <FaProjectDiagram />,
      trend: stats.comparisons.activeProjects
    },
    {
      title: 'Completed Projects',
      value: isLoading ? '...' : stats.completedProjects.toLocaleString(),
      icon: <FaCheckCircle />,
      trend: stats.comparisons.completedProjects
    },
    {
      title: 'Revenue',
      value: isLoading ? '...' : `$${stats.revenue.toLocaleString()}`,
      icon: <FaMoneyBillWave />,
      trend: stats.comparisons.revenue
    }
  ]

  const kpiCards = [
    {
      title: 'Active User Rate',
      value: isLoading ? '...' : `${stats.kpis?.activeUserRate ?? 0}%`,
      icon: <FaUserCheck />
    },
    {
      title: 'Avg Completed Value',
      value: isLoading ? '...' : `$${(stats.kpis?.avgCompletedProjectValue ?? 0).toLocaleString()}`,
      icon: <FaDollarSign />
    },
    {
      title: 'Completion Rate',
      value: isLoading ? '...' : `${stats.kpis?.completionRate ?? 0}%`,
      icon: <FaBullseye />
    },
    {
      title: 'New Projects (30d)',
      value: isLoading ? '...' : (stats.kpis?.newProjectsLast30 ?? 0).toLocaleString(),
      icon: <FaLayerGroup />,
      trend: stats.kpis?.newProjectsTrend ?? 0
    }
  ]

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Dashboard Overview</h2>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Metrics comparison: Current 30 days vs Previous 30 days</p>
        </div>
        <button onClick={fetchDashboardStats} className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all text-sm font-medium'>
          Refresh Stats
        </button>
      </div>

      {error && <div className='mb-6 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300'>{error}</div>}

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} isLoading={isLoading} />
        ))}
      </div>

      <div className='mt-8'>
        <div className='flex items-center gap-2 mb-4'>
          <FaChartLine className='text-accent' />
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Advanced KPI Metrics</h3>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {kpiCards.map((stat, index) => (
            <StatCard key={`kpi-${index}`} {...stat} isLoading={isLoading} />
          ))}
        </div>
      </div>

      <AdminAlertsPanel isLoading={isLoading} alertSummary={stats.alertSummary} alerts={stats.alerts} healthSignals={stats.healthSignals} />
      <AdminAuditLogPanel />
    </div>
  )
}

export default AdminStats
