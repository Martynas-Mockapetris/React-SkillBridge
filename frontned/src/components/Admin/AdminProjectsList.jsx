import { FaSearch, FaFilter, FaPlus } from 'react-icons/fa'

const AdminProjectsList = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Projects Overview</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90">
          <FaPlus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <FaFilter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Project Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Project Name</h3>
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Active
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Project description goes here. A brief overview of what this project is about.
          </p>
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <span>Deadline: Dec 31, 2024</span>
            <span>Progress: 75%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProjectsList
