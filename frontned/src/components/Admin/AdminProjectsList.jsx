import { FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaLock } from 'react-icons/fa'
import { useState } from 'react'

const AdminProjectsList = () => {
  // State
  const STATUS_OPTIONS = ['All', 'Active', 'Planning', 'On Hold', 'Completed']
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  // Data
  const projectsData = [
    {
      id: 1,
      name: 'E-commerce Platform',
      description: 'Building a modern e-commerce platform with React and Node.js',
      status: 'Active',
      deadline: '2024-12-31',
      progress: 75,
      priority: 'High',
      team: ['John Doe', 'Jane Smith'],
      category: 'Web Development'
    },
    {
      id: 2,
      name: 'Mobile Banking App',
      description: 'Developing a secure mobile banking application',
      status: 'Planning',
      deadline: '2024-10-15',
      progress: 25,
      priority: 'Medium',
      team: ['Mike Johnson', 'Sarah Wilson'],
      category: 'Mobile Development'
    },
    {
      id: 3,
      name: 'Marketing Dashboard',
      description: 'Creating analytics dashboard for marketing team',
      status: 'On Hold',
      deadline: '2024-09-30',
      progress: 50,
      priority: 'Low',
      team: ['Alex Brown', 'Emily Davis'],
      category: 'Analytics'
    }
  ]

  // State variables for filtering and sorting
  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'On Hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      Completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
    return colors[status] || colors['Active']
  }

  // Function to get filtered projects based on selected status
  const getFilteredProjects = () => {
    return projectsData.filter((project) => {
      const matchesStatus = selectedStatus === 'All' || project.status === selectedStatus
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) || project.description.toLowerCase().includes(searchQuery.toLowerCase()) || project.category.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }

  const ProgressBar = ({ progress }) => (
    <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2'>
      <div className='bg-accent h-2.5 rounded-full transition-all duration-300' style={{ width: `${progress}%` }} />
    </div>
  )

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Projects Overview</h2>
        <button className='flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90'>
          <FaPlus className='w-4 h-4' />
          New Project
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className='mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm'>
        <div className='flex gap-4'>
          <div className='flex-1 relative'>
            <input
              type='text'
              placeholder='Search projects...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            />
            <FaSearch className='absolute left-3 top-3 text-gray-400' />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className='px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className='flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700'>
            <FaFilter className='w-4 h-4' />
            Filters
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Project Card */}
        {getFilteredProjects().map((project) => (
          <div key={project.id} className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
            <div className='flex justify-between items-start mb-4'>
              <h3 className='font-semibold text-gray-900 dark:text-white'>{project.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>{project.status}</span>
            </div>
            <p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>{project.description}</p>
            <div className='space-y-2'>
              <div className='flex justify-between items-center text-sm text-gray-500 dark:text-gray-400'>
                <span>Deadline: {project.deadline}</span>
                <span>Progress: {project.progress}%</span>
              </div>
              <ProgressBar progress={project.progress} />
              <div className='flex justify-between items-center text-sm text-gray-500 dark:text-gray-400'>
                <span>Priority: {project.priority}</span>
                <span>Team: {project.team.length}</span>
              </div>
            </div>
            <div className='mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3'>
              <button className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200'>
                <FaEdit className='w-4 h-4' />
              </button>
              <button className='text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200'>
                <FaLock className='w-4 h-4' />
              </button>
              <button className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200'>
                <FaTrash className='w-4 h-4' />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminProjectsList
