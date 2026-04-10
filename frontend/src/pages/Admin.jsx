import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminHeader from '../components/Admin/AdminHeader'
import AdminSidebar from '../components/Admin/AdminSidebar'
import AdminStats from '../components/Admin/AdminStats'
import AdminUsersList from '../components/Admin/AdminUsersList'
import AdminProjectsList from '../components/Admin/AdminProjectsList'
import AdminAnnouncementsList from '../components/Admin/AdminAnnouncementsList'
import AdminSettings from '../components/Admin/AdminSettings'
import AdminBlogPostsList from '../components/Admin/AdminBlogPostsList'

const formatLabel = (value) => {
  if (!value) return ''
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

const Admin = () => {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [activeSettingsSection, setActiveSettingsSection] = useState('home')

  const breadcrumbItems = useMemo(() => {
    const items = [{ label: 'Admin', to: '/admin' }]

    if (activeSection === 'settings') {
      items.push({ label: 'Settings' })

      if (activeSettingsSection) {
        items.push({ label: formatLabel(activeSettingsSection) })
      }

      return items
    }

    items.push({ label: formatLabel(activeSection) })
    return items
  }, [activeSection, activeSettingsSection])

  return (
    <div className='flex h-screen bg-gray-100 dark:bg-gray-900 pt-[68px]'>
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} activeSettingsSection={activeSettingsSection} setActiveSettingsSection={setActiveSettingsSection} />

      <div className='flex-1 flex flex-col overflow-hidden'>
        <AdminHeader />
        <main className='flex-1 overflow-x-hidden overflow-y-auto'>
          <div className='container mx-auto px-6 py-8'>
            <nav aria-label='Breadcrumb' className='mb-4'>
              <ol className='flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
                {breadcrumbItems.map((item, index) => {
                  const isLast = index === breadcrumbItems.length - 1

                  return (
                    <li key={`${item.label}-${index}`} className='flex items-center gap-2'>
                      {index > 0 && <span>/</span>}
                      {item.to && !isLast ? (
                        <Link to={item.to} className='hover:text-accent transition-colors'>
                          {item.label}
                        </Link>
                      ) : (
                        <span className={isLast ? 'text-gray-900 dark:text-white font-medium' : ''}>{item.label}</span>
                      )}
                    </li>
                  )
                })}
              </ol>
            </nav>

            {activeSection === 'dashboard' && <AdminStats />}
            {activeSection === 'users' && <AdminUsersList />}
            {activeSection === 'projects' && <AdminProjectsList />}
            {activeSection === 'announcements' && <AdminAnnouncementsList />}
            {activeSection === 'blog' && <AdminBlogPostsList />}
            {activeSection === 'settings' && <AdminSettings activeSectionId={activeSettingsSection} />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Admin
