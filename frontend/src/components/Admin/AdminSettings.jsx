const settingsSections = [
  { id: 'about', title: 'About Page', description: 'Manage About page content and visibility settings.' },
  { id: 'contact', title: 'Contact Info', description: 'Manage platform contact channels and support details.' },
  { id: 'mail', title: 'Mail Settings', description: 'Configure mail provider and notification defaults.' },
  { id: 'system', title: 'System Settings', description: 'General platform settings and admin defaults.' }
]

const AdminSettings = () => {
  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Settings</h2>
        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Admin configuration center</p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {settingsSections.map((section) => (
          <div key={section.id} className='rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>{section.title}</h3>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>{section.description}</p>
            <button disabled className='mt-4 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 opacity-70 cursor-not-allowed' title='Will be enabled in next commits'>
              Coming Soon
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminSettings
