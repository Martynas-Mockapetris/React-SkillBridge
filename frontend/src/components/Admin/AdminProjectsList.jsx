import { FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaLock } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import ProjectModal from '../../modal/ProjectModal'
import AdminProjectCancelModal from '../../modal/AdminProjectCancelModal'
import AdminProjectEditModal from '../../modal/AdminProjectEditModal'
import { getAdminAllProjects, deleteProjectAsAdmin, updateProjectAsAdmin, toggleProjectLockAsAdmin } from '../../services/projectService'

const AdminProjectsList = () => {
  // State
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedPriority, setPriority] = useState('All')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [sortBy, setSortBy] = useState('createdAt:desc')
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false)
  const [lockLoadingProjectId, setLockLoadingProjectId] = useState(null)

  // Data
  const [projectsData, setProjectsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'low',
    deadline: '',
    status: 'active'
  })

  const formatStatusLabel = (status) => {
    if (!status) return 'Unknown'
    if (status === 'cancelled_by_admin') return 'Canceled by Admin'
    return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const formatPriorityLabel = (priority) => {
    if (!priority) return 'Low'
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  const statusOptions = ['All', ...new Set(projectsData.map((project) => project.status).filter(Boolean))]
  const categoryOptions = ['All', ...new Set(projectsData.map((project) => project.category).filter(Boolean))]
  const priorityOptions = ['All', ...new Set(projectsData.map((project) => project.priority).filter(Boolean))]

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getAdminAllProjects()

      // Map backend project shape to current card UI shape
      const mapped = data.map((project) => ({
        id: project._id,
        name: project.title || 'Untitled project',
        description: project.description || 'No description',
        status: project.status || 'inactive',
        createdAt: project.createdAt || '',
        deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
        progress: project.status === 'completed' ? 100 : project.status === 'in_progress' ? 65 : project.status === 'under_review' ? 90 : project.status === 'negotiating' ? 35 : project.status === 'assigned' ? 20 : 0,
        priority: project.priority || 'low',
        team: [`${project.user?.firstName || ''} ${project.user?.lastName || ''}`.trim() || 'Owner', project.assignee ? `${project.assignee.firstName || ''} ${project.assignee.lastName || ''}`.trim() : null].filter(
          Boolean
        ),
        category: project.category || 'General'
      }))

      setProjectsData(mapped)
    } catch (err) {
      console.error('Error fetching admin projects:', err)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const openDeleteModal = (project) => {
    setProjectToDelete(project)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setProjectToDelete(null)
    setIsDeleteModalOpen(false)
  }

  const openEditModal = (project) => {
    setProjectToEdit(project)
    setEditForm({
      title: project.name || '',
      description: project.description || '',
      category: project.category || '',
      priority: project.priority || 'low',
      deadline: project.deadline || '',
      status: project.status || 'active'
    })
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setProjectToEdit(null)
    setIsEditModalOpen(false)
  }

  const handleEditProject = async () => {
    if (!projectToEdit) return

    try {
      setEditLoading(true)
      await updateProjectAsAdmin(projectToEdit.id, {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        priority: editForm.priority,
        deadline: editForm.deadline,
        status: editForm.status
      })
      await fetchProjects()
      closeEditModal()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update project')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return

    try {
      setDeleteLoading(true)
      await deleteProjectAsAdmin(projectToDelete.id)
      await fetchProjects()
      closeDeleteModal()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel project')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleToggleProjectLock = async (project) => {
    try {
      setLockLoadingProjectId(project.id)
      await toggleProjectLockAsAdmin(project.id)
      await fetchProjects()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to change project lock status')
    } finally {
      setLockLoadingProjectId(null)
    }
  }

  // State variables for filtering and sorting
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      negotiating: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      in_progress: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      cancelled_by_admin: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
      deleted_by_owner: 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-200',
      inactive: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300',
      archived: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300',
      paused: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    }
    return colors[status] || colors.inactive
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
    const [field, direction] = sortBy.split(':')
    const order = direction === 'desc' ? -1 : 1

    return [...projects].sort((a, b) => {
      switch (field) {
        case 'deadline': {
          const aDate = a.deadline ? new Date(a.deadline).getTime() : 0
          const bDate = b.deadline ? new Date(b.deadline).getTime() : 0
          return (aDate - bDate) * order
        }

        case 'createdAt': {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return (aDate - bDate) * order
        }

        case 'progress':
          return (a.progress - b.progress) * order

        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          const aPriority = priorityOrder[a.priority] || 0
          const bPriority = priorityOrder[b.priority] || 0
          return (aPriority - bPriority) * order
        }

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
        <button onClick={() => setIsNewProjectModalOpen(true)} className='flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90'>
          <FaPlus className='w-4 h-4' />
          New Project
        </button>
      </div>

      <ProjectModal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} onProjectCreated={fetchProjects} mode='create' />

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
            className='px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            title='Filter by project status'>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Statuses' : formatStatusLabel(status)}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className='px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            title='Filter by category'>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category === 'All' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setPriority(e.target.value)}
            className='px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            title='Filter by priority'>
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority === 'All' ? 'All Priorities' : formatPriorityLabel(priority)}
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
          <option value='createdAt:desc'>Created (Newest first)</option>
          <option value='createdAt:asc'>Created (Oldest first)</option>
          <option value='deadline:asc'>Deadline (Oldest first)</option>
          <option value='deadline:desc'>Deadline (Newest first)</option>
          <option value='progress:asc'>Progress (Low to High)</option>
          <option value='progress:desc'>Progress (High to Low)</option>
          <option value='priority:asc'>Priority (Low to High)</option>
          <option value='priority:desc'>Priority (High to Low)</option>
        </select>
      </div>

      {loading && <div className='mb-4 rounded-lg bg-white dark:bg-gray-800 p-4 text-sm text-gray-500 dark:text-gray-300'>Loading projects...</div>}
      {error && <div className='mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-300'>{error}</div>}
      {/* Projects Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Project Card */}
        {getSortedProjects(getFilteredProjects()).map((project) => {
          const isAdminCancelled = project.status === 'cancelled_by_admin'
          const isProjectLocked = project.status === 'paused'

          return (
            <div key={project.id} className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6'>
              <div className='flex justify-between items-start mb-4'>
                <h3 className='font-semibold text-gray-900 dark:text-white'>{project.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>{formatStatusLabel(project.status)}</span>{' '}
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
                <button
                  onClick={() => openEditModal(project)}
                  disabled={isAdminCancelled}
                  title={isAdminCancelled ? 'Project was canceled by admin. Editing is disabled.' : 'Edit project'}
                  className={`${isAdminCancelled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200'}`}>
                  <FaEdit className='w-4 h-4' />
                </button>

                <button
                  onClick={() => handleToggleProjectLock(project)}
                  disabled={isAdminCancelled || lockLoadingProjectId === project.id}
                  title={isAdminCancelled ? 'Project was canceled by admin. Status changes are disabled.' : isProjectLocked ? 'Unlock project' : 'Lock / Pause project'}
                  className={`${
                    isAdminCancelled || lockLoadingProjectId === project.id
                      ? 'text-gray-400 cursor-not-allowed'
                      : isProjectLocked
                        ? 'text-red-800 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400'
                        : 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200'
                  }`}>
                  <FaLock className='w-4 h-4' />
                </button>

                <button
                  onClick={() => openDeleteModal(project)}
                  disabled={isAdminCancelled}
                  title={isAdminCancelled ? 'Project already canceled by admin.' : 'Cancel project as admin'}
                  className={`${isAdminCancelled ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200'}`}>
                  <FaTrash className='w-4 h-4' />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <AdminProjectEditModal isOpen={isEditModalOpen} onClose={closeEditModal} onSave={handleEditProject} loading={editLoading} form={editForm} setForm={setEditForm} />
      <AdminProjectCancelModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleDeleteProject} projectName={projectToDelete?.name} loading={deleteLoading} />
    </div>
  )
}

export default AdminProjectsList
