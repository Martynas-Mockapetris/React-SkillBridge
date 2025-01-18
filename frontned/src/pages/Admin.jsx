import { useState } from 'react'
import AdminHeader from '../components/admin/AdminHeader'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminStats from '../components/admin/AdminStats'
import AdminUsersList from '../components/admin/AdminUsersList'
import AdminProjectsList from '../components/admin/AdminProjectsList'

const Admin = () => {
  const [activeSection, setActiveSection] = useState('dashboard')

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 pt-[100px]">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
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
