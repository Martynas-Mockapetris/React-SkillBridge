import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AdminHeader from '../components/Admin/AdminHeader'
import AdminSidebar from '../components/Admin/AdminSidebar'
import AdminStats from '../components/Admin/AdminStats'
import AdminUsersList from '../components/Admin/AdminUsersList'
import AdminProjectsList from '../components/Admin/AdminProjectsList'
import AdminAnnouncementsList from '../components/Admin/AdminAnnouncementsList'
import AdminSettings from '../components/Admin/AdminSettings'
import AdminBlogPostsList from '../components/Admin/AdminBlogPostsList'
import { useAuth } from '../context/AuthContext'
import { canAccessAdminSection, getAdminSections, getDefaultAdminSection } from '../utils/accessRoles'

const formatLabel = (value) => {
  if (!value) return ''
  return value.replace(/[-_.]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

const getSettingsBreadcrumbItems = (activeSettingsSection) => {
  const items = [{ label: 'Admin', to: '/admin' }, { label: 'Settings' }]

  if (!activeSettingsSection) {
    return items
  }

  if (activeSettingsSection.startsWith('home.')) {
    const [, child] = activeSettingsSection.split('.')
    items.push({ label: 'Home Page' })
    items.push({ label: formatLabel(child === 'hero' ? 'hero sections' : child) })
    return items
  }

  items.push({ label: formatLabel(activeSettingsSection) })
  return items
}

const Admin = () => {
  const { currentUser } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [activeSettingsSection, setActiveSettingsSection] = useState('home.hero')
  const [adminSectionRequest, setAdminSectionRequest] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const availableSections = useMemo(() => getAdminSections(currentUser), [currentUser])
  const defaultSection = useMemo(() => getDefaultAdminSection(currentUser), [currentUser])

  const buildRequestFromSearchParams = () => {
    const section = searchParams.get('section') || 'dashboard'

    const filters = {
      status: searchParams.get('status') || '',
      verification: searchParams.get('verification') || '',
      passwordResetRequired: searchParams.get('passwordResetRequired') || '',
      stalled: searchParams.get('stalled') || '',
      sort: searchParams.get('sort') || ''
    }

    return { section, filters }
  }

  const updateAdminSearchParams = (section, filters = {}) => {
    const nextParams = new URLSearchParams()

    nextParams.set('section', section)

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value)
      }
    })

    setSearchParams(nextParams)
  }

  const handleSetActiveSection = (section) => {
    setActiveSection(section)
    setAdminSectionRequest(null)
    updateAdminSearchParams(section)
  }

  const handleOpenSection = (section, filters = {}) => {
    setActiveSection(section)
    setAdminSectionRequest({
      section,
      filters,
      requestId: Date.now()
    })
    updateAdminSearchParams(section, filters)
  }

  useEffect(() => {
    if (!defaultSection) {
      return
    }

    if (!canAccessAdminSection(currentUser, activeSection)) {
      setActiveSection(defaultSection)
      setAdminSectionRequest(null)
      updateAdminSearchParams(defaultSection)
    }
  }, [currentUser, activeSection, defaultSection])

  const breadcrumbItems = useMemo(() => {
    if (activeSection === 'settings') {
      return getSettingsBreadcrumbItems(activeSettingsSection)
    }

    return [{ label: 'Admin', to: '/admin' }, { label: formatLabel(activeSection) }]
  }, [activeSection, activeSettingsSection])

  if (!availableSections.length) {
    return null
  }

  useEffect(() => {
    const { section, filters } = buildRequestFromSearchParams()

    if (!canAccessAdminSection(currentUser, section)) {
      return
    }

    setActiveSection(section)

    if (section === 'users' || section === 'projects') {
      setAdminSectionRequest({
        section,
        filters,
        requestId: Date.now()
      })
    } else {
      setAdminSectionRequest(null)
    }
  }, [searchParams, currentUser])

  return (
    <div className='flex min-h-[calc(100vh-68px)] bg-gray-100 dark:bg-gray-900 pt-[68px]'>
      <AdminSidebar activeSection={activeSection} setActiveSection={handleSetActiveSection} activeSettingsSection={activeSettingsSection} setActiveSettingsSection={setActiveSettingsSection} />

      <div className='flex-1 min-w-0 flex flex-col'>
        <AdminHeader activeSection={activeSection} />
        <main className='flex-1 overflow-x-hidden'>
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

            {activeSection === 'dashboard' && canAccessAdminSection(currentUser, 'dashboard') && <AdminStats onOpenSection={handleOpenSection} />}
            {activeSection === 'users' && canAccessAdminSection(currentUser, 'users') && <AdminUsersList navigationRequest={adminSectionRequest} />}
            {activeSection === 'projects' && canAccessAdminSection(currentUser, 'projects') && <AdminProjectsList navigationRequest={adminSectionRequest} />}
            {activeSection === 'announcements' && canAccessAdminSection(currentUser, 'announcements') && <AdminAnnouncementsList />}
            {activeSection === 'blog' && canAccessAdminSection(currentUser, 'blog') && <AdminBlogPostsList />}
            {activeSection === 'settings' && canAccessAdminSection(currentUser, 'settings') && <AdminSettings activeSectionId={activeSettingsSection} />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Admin
