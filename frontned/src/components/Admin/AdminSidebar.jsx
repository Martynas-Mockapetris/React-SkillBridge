import { FaChartBar, FaUsers, FaProjectDiagram, FaCog } from 'react-icons/fa'

const AdminSidebar = ({ activeSection, setActiveSection }) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { id: 'users', label: 'Users', icon: <FaUsers /> },
    { id: 'projects', label: 'Projects', icon: <FaProjectDiagram /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> }
  ]

  return (
    <div className="h-screen w-64 bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex h-full flex-col">
        <nav className="space-y-1 p-4">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200
                ${activeSection === item.id 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default AdminSidebar
