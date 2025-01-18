import { FaBell, FaSearch, FaUser } from 'react-icons/fa'

const AdminHeader = ({ activeSection }) => {
  // Convert section ID to display title
  const getSectionTitle = (section) => {
    const titles = {
      dashboard: 'Dashboard Overview',
      users: 'Users Management',
      projects: 'Projects Overview',
      settings: 'System Settings'
    }
    return titles[section] || 'Admin Dashboard'
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow pl-20 lg:pl-4">
      <div className="px-4 py-6 flex justify-between items-center">
        {/* Left side - Title */}
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          {getSectionTitle(activeSection)}
        </h1>

        {/* Right side - Actions [Icons] */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-accent dark:text-gray-300">
            <FaSearch className="text-xl" />
          </button>
          <button className="p-2 text-gray-600 hover:text-accent dark:text-gray-300">
            <FaBell className="text-xl" />
          </button>
          <button className="p-2 text-gray-600 hover:text-accent dark:text-gray-300">
            <FaUser className="text-xl" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader