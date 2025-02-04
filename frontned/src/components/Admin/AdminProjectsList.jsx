import { FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaLock } from 'react-icons/fa'
import { useState } from 'react'

const AdminProjectsList = () => {
  // State
  const STATUS_OPTIONS = ['All', 'Active', 'Planning', 'On Hold', 'Completed']
  const CATEGORY_OPTIONS = ['All', 'Web Development', 'Mobile Development', 'Analytics', 'Design', 'Marketing']
  const PRIORITY_OPTIONS = ['All', 'High', 'Medium', 'Low']
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedPriority, setPriority] = useState('All')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [sortBy, setSortBy] = useState('deadline')

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
      const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory
      const matchesPriority = selectedPriority === 'All' || project.priority === selectedPriority
      const matchesDateRange = (!dateRange.start || project.deadline >= dateRange.start) && (!dateRange.end || project.deadline <= dateRange.end)
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) || project.description.toLowerCase().includes(searchQuery.toLowerCase()) || project.category.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesStatus && matchesCategory && matchesPriority && matchesDateRange && matchesSearch
    })
  }

  const ProgressBar = ({ progress }) => (
    <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2'>
      <div className='bg-accent h-2.5 rounded-full transition-all duration-300' style={{ width: `${progress}%` }} />
    </div>
  )

  const TeamAvatars = ({ team }) => (
    <div className='flex -space-x-2'>
      {team.map((member, index) => (
        <div key={index} className='w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs border-2 border-white dark:border-gray-800' title={member}>
          {member
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </div>
      ))}
    </div>
  )

  const clearFilters = () => {
    setSelectedStatus('All')
    setSelectedCategory('All')
    setPriority('All')
    setDateRange({ start: '', end: '' })
    setSearchQuery('')
  }

  // Sorting
  const getSortedProjects = (projects) => {
    return [...projects].sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline)
        case 'progress':
          return b.progress - a.progress
        case 'priority':
          const priorityOrder = { High: 3, Medium: 2, Low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        default:
          return 0
      }
    })
  }

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex flex-col'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Projects Overview</h2>
          <div className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
            Showing {getFilteredProjects().length} {getFilteredProjects().length === 1 ? 'project' : 'projects'}
            {getFilteredProjects().length !== projectsData.length && ` out of ${projectsData.length} total`}
          </div>
        </div>
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
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className='px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setPriority(e.target.value)}
            className='px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <div className='flex gap-2'>
            <input
              type='date'
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className='px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            />
            <input
              type='date'
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className='px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            />
          </div>
          <button onClick={clearFilters} className='flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'>
            <FaFilter className='w-4 h-4' />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Sort Bar */}
      <div className='flex justify-end mb-4'>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className='px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
          <option value='deadline'>Sort by Deadline</option>
          <option value='progress'>Sort by Progress</option>
          <option value='priority'>Sort by Priority</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Project Card */}
        {getSortedProjects(getFilteredProjects()).map((project) => (
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
                <TeamAvatars team={project.team} />
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
