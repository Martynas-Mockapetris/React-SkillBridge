import { useState } from 'react'
import AdminHeader from '../components/Admin/AdminHeader'
import AdminSidebar from '../components/Admin/AdminSidebar'
import AdminStats from '../components/Admin/AdminStats'
import AdminUsersList from '../components/Admin/AdminUsersList'
import AdminProjectsList from '../components/Admin/AdminProjectsList'

const Admin = () => {
  const [activeSection, setActiveSection] = useState('dashboard')

  return (
    <div className='flex h-screen bg-gray-100 dark:bg-gray-900 pt-[68px]'>
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <AdminHeader />
        <main className='flex-1 overflow-x-hidden overflow-y-auto'>
          <div className='container mx-auto px-6 py-8'>
            {activeSection === 'dashboard' && <AdminStats />}
            {activeSection === 'users' && <AdminUsersList />}
            {activeSection === 'projects' && <AdminProjectsList />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Admin
