import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getAdminUserDetail } from '../services/userService'

const tabs = [
  { id: 'details', label: 'User Details' },
  { id: 'profile', label: 'Profile' },
  { id: 'projects', label: 'Projects' },
  { id: 'announcements', label: 'Announcements' }
]

const formatDateTime = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString()
}

const AdminUserDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('details')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [metrics, setMetrics] = useState(null)

  const headerSubtitle = useMemo(() => {
    if (!id) return 'No user selected'
    if (!user) return `User ID: ${id}`
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ID: ${id}`
  }, [id, user])

  useEffect(() => {
    const loadUserDetail = async () => {
      if (!id) {
        setError('Missing user id in route')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const response = await getAdminUserDetail(id)
        setUser(response.user || null)
        setMetrics(response.metrics || null)
      } catch (err) {
        const message = err?.response?.data?.message || 'Failed to load user details'
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    loadUserDetail()
  }, [id])

  const statusLabel = useMemo(() => {
    if (!user) return 'Unknown'
    if (user.isLocked) return 'Locked'
    return 'Active'
  }, [user])

  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-900 pt-[68px]'>
      <div className='container mx-auto px-6 py-8'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Admin User Detail</h1>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>{headerSubtitle}</p>
          </div>

          <button onClick={() => navigate('/admin')} className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'>
            Back to Admin
          </button>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm'>
          <div className='border-b border-gray-200 dark:border-gray-700 px-4 pt-4'>
            <div className='flex flex-wrap gap-2'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                    activeTab === tab.id ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className='p-6'>
            {loading && <p className='text-gray-700 dark:text-gray-200'>Loading user details...</p>}
            {!loading && error && <p className='text-red-600 dark:text-red-400'>{error}</p>}

            {!loading && !error && activeTab === 'details' && user && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Full Name</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}</p>
                </div>

                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Email</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{user.email || 'N/A'}</p>
                </div>

                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Role</p>
                  <p className='text-gray-900 dark:text-white font-medium capitalize'>{user.userType || 'N/A'}</p>
                </div>

                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Status</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{statusLabel}</p>
                </div>

                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Created At</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{formatDateTime(user.createdAt)}</p>
                </div>

                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Last Login</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{formatDateTime(user.lastLogin)}</p>
                </div>

                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Created Projects</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{metrics?.createdProjects ?? 0}</p>
                </div>

                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Assigned Projects</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{metrics?.assignedProjects ?? 0}</p>
                </div>

                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Completed Projects</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{metrics?.completedProjects ?? 0}</p>
                </div>

                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Active Announcements</p>
                  <p className='text-gray-900 dark:text-white font-medium'>
                    {metrics?.activeAnnouncements ?? 0} / {metrics?.totalAnnouncements ?? 0}
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && activeTab === 'profile' && <p className='text-gray-700 dark:text-gray-200'>Profile tab</p>}
            {!loading && !error && activeTab === 'projects' && <p className='text-gray-700 dark:text-gray-200'>Projects tab</p>}
            {!loading && !error && activeTab === 'announcements' && <p className='text-gray-700 dark:text-gray-200'>Announcements tab</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUserDetail
