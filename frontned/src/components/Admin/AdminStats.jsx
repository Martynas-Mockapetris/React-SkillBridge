import StatCard from './StatCard'
import { FaUsers, FaProjectDiagram, FaTasks, FaMoneyBillWave } from 'react-icons/fa'

const AdminStats = () => {
  const stats = [
    { title: 'Total Users', value: '1,234', icon: <FaUsers />, trend: 12 },
    { title: 'Active Projects', value: '45', icon: <FaProjectDiagram />, trend: 8 },
    { title: 'Completed Tasks', value: '789', icon: <FaTasks />, trend: 15 },
    { title: 'Revenue', value: '$12,345', icon: <FaMoneyBillWave />, trend: -5 }
  ]

  return (
    <div>
      <h2 className='text-xl font-semibold mb-4'>Dashboard Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  )
}

export default AdminStats