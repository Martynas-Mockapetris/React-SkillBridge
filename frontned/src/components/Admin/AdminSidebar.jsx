const AdminSidebar = ({ activeSection, setActiveSection }) => {
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Users' },
    { id: 'projects', label: 'Projects' },
    { id: 'settings', label: 'Settings' }
  ]

  return (
    <div className='h-screen w-64'>
      <div className='flex h-full flex-col'>
        <nav className='space-y-1'>
          {navigationItems.map((item) => (
            <button key={item.id} onClick={() => setActiveSection(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default AdminSidebar
