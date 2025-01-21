import { FaEdit, FaTrash, FaLock, FaEnvelope, FaUserCog, FaSearch } from 'react-icons/fa'
import { useState } from 'react'

const AdminUsersList = () => {
  const [selectedSubscription, setSelectedSubscription] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })

  const subscriptionTypes = ['Basic', 'Creator Premium', 'Freelancer Premium', 'Full Package']
  const statusTypes = ['Active', 'Inactive', 'Pending']
  const roleTypes = ['Developer', 'Designer', 'Project Manager', 'Content Creator', 'Marketing Specialist', 'UX/UI', 'Cryptocurrency Expert', 'Web Developer', 'Full-Stack', 'Frontend', 'Backend']

  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Developer',
      status: 'Active',
      joinDate: '2025-01-15',
      subscription: {
        type: 'Freelancer Premium',
        status: 'Active'
      }
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Designer',
      status: 'Inactive',
      joinDate: '2025-02-01',
      subscription: {
        type: 'Creator Premium',
        status: 'Active'
      }
    }
  ]

  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  const getSubscriptionColor = (type) => {
    const colors = {
      Basic: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'Creator Premium': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'Freelancer Premium': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'Full Package': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
    }
    return colors[type] || colors['Basic']
  }

  return (
    <div>
      <h2 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>Users Management</h2>
      {/* Filters Section */}
      <div className='mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4'>
        {/* Search Row */}
        <div className='w-full'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Search users...'
              className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            />
            <FaSearch className='absolute left-3 top-3 text-gray-400' />
          </div>
        </div>

        {/* Filters Row */}
        <div className='flex flex-wrap gap-3 w-full'>
          <select
            value={selectedSubscription}
            onChange={(e) => setSelectedSubscription(e.target.value)}
            className='flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
            <option value=''>All Subscriptions</option>
            {subscriptionTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className='flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
            <option value=''>All Status</option>
            {statusTypes.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className='flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
            <option value=''>All Roles</option>
            {roleTypes.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <input
            type='date'
            value={dateRange.start}
            onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
            className='flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
          />
          <input
            type='date'
            value={dateRange.end}
            onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
            className=' flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
          />

          <button className='flex-1 min-w-[200px] px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors'>Apply Filters</button>

          <button
            onClick={() => {
              setSelectedSubscription(''), setSelectedStatus(''), setSelectedRole(''), setDateRange({ start: '', end: '' })
            }}
            className='px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'>
            Reset
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className='overflow-x-auto'>
        <div className='min-w-[800px] sm:w-full p-4 sm:p-0'>
          <table className='min-w-full bg-white dark:bg-gray-800 rounded-lg'>
            <thead>
              <tr className='bg-gray-50 dark:bg-gray-700'>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Name</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Email</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Role</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Subscription</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Join Date</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100'>{user.name}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{user.email}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{user.role}</td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>{user.status}</span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSubscriptionColor(user.subscription.type)}`}>{user.subscription.type}</span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{user.joinDate}</td>
                  {/* Quick Actions */}
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3 flex'>
                    <button className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200'>
                      <FaEdit className='w-4 h-4' />
                    </button>
                    <button className='text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200'>
                      <FaUserCog className='w-4 h-4' />
                    </button>
                    <button className='text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200'>
                      <FaLock className='w-4 h-4' />
                    </button>
                    <button className='text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-200'>
                      <FaEnvelope className='w-4 h-4' />
                    </button>
                    <button className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200'>
                      <FaTrash className='w-4 h-4' />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminUsersList
