import { FaEdit, FaTrash } from 'react-icons/fa'

const AdminUsersList = () => {
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Developer',
      status: 'Active',
      joinDate: '2025-01-15'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'Designer',
      status: 'Inactive',
      joinDate: '2025-02-01'
    }
  ]

  // Function to get status color based on status
  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }

  return (
    <div>
      <h2 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>Users Management</h2>
      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white dark:bg-gray-800 rounded-lg'>
          <thead>
            <tr className='bg-gray-50 dark:bg-gray-700'>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Name</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Email</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Role</th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Status</th>
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
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{user.joinDate}</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3'>
                  <button className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200'>
                    <FaEdit className='w-4 h-4' />
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
  )
}

export default AdminUsersList
