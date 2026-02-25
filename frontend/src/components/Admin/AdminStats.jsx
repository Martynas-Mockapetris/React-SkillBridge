import { useState, useEffect } from 'react'
import StatCard from './StatCard'
import { FaUsers, FaProjectDiagram, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa'

const AdminStats = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProjects: 0,
    completedProjects: 0,
    revenue: 0,
    // Comparison data (current vs previous 30 days)
    comparisons: {
      users: 0,
      activeProjects: 0,
      completedProjects: 0,
      revenue: 0
    }
  })

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call in future tasks
      // Simulated data for now
      setTimeout(() => {
        setStats({
          totalUsers: 0,
          activeProjects: 0,
          completedProjects: 0,
          revenue: 0,
          comparisons: {
            users: 0,
            activeProjects: 0,
            completedProjects: 0,
            revenue: 0
          }
        })
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
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

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} isLoading={isLoading} />
        ))}
      </div>
    </div>
  )
}

export default AdminStats
