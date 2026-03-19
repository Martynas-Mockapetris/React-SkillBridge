import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const tabs = [
  { id: 'details', label: 'User Details' },
  { id: 'profile', label: 'Profile' },
  { id: 'projects', label: 'Projects' },
  { id: 'announcements', label: 'Announcements' }
]

const AdminUserDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('details')

  const headerSubtitle = useMemo(() => (id ? `User ID: ${id}` : 'No user selected'), [id])

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
            {activeTab === 'details' && <p className='text-gray-700 dark:text-gray-200'>Test</p>}
            {activeTab === 'profile' && <p className='text-gray-700 dark:text-gray-200'>Test</p>}
            {activeTab === 'projects' && <p className='text-gray-700 dark:text-gray-200'>Test</p>}
            {activeTab === 'announcements' && <p className='text-gray-700 dark:text-gray-200'>Test</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminUserDetail
