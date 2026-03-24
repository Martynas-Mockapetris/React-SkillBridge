import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { getSystemConfig, updateSystemConfigSection } from '../../services/configService'

const settingsSections = [
  { id: 'about', title: 'About Page', description: 'Manage About page content and visibility settings.' },
  { id: 'contact', title: 'Contact Info', description: 'Manage platform contact channels and support details.' },
  { id: 'mail', title: 'Mail Settings', description: 'Configure mail provider and notification defaults.' },
  { id: 'system', title: 'System Settings', description: 'General platform settings and admin defaults.' }
]

const AdminSettings = () => {
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState(null)
  const [savingSection, setSavingSection] = useState('')

  const [drafts, setDrafts] = useState({
    about: { enabled: true, valuesText: '{}' },
    contact: { enabled: true, valuesText: '{}' },
    mail: { enabled: true, valuesText: '{}' },
    system: { enabled: true, valuesText: '{}' }
  })

  const sectionMap = useMemo(() => {
    if (!config) return {}
    return {
      about: config.about || {},
      contact: config.contact || {},
      mail: config.mail || {},
      system: config.system || {}
    }
  }, [config])

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        const data = await getSystemConfig()
        setConfig(data)

        setDrafts({
          about: {
            enabled: data?.about?.enabled ?? true,
            valuesText: JSON.stringify(data?.about?.values ?? {}, null, 2)
          },
          contact: {
            enabled: data?.contact?.enabled ?? true,
            valuesText: JSON.stringify(data?.contact?.values ?? {}, null, 2)
          },
          mail: {
            enabled: data?.mail?.enabled ?? true,
            valuesText: JSON.stringify(data?.mail?.values ?? {}, null, 2)
          },
          system: {
            enabled: data?.system?.enabled ?? true,
            valuesText: JSON.stringify(data?.system?.values ?? {}, null, 2)
          }
        })
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  const handleDraftChange = (sectionId, key, value) => {
    setDrafts((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [key]: value
      }
    }))
  }

  const handleSaveSection = async (sectionId) => {
    try {
      setSavingSection(sectionId)

      let parsedValues = {}
      try {
        parsedValues = JSON.parse(drafts[sectionId].valuesText || '{}')
      } catch {
        toast.error(`Invalid JSON in ${sectionId} values`)
        return
      }

      const payload = {
        enabled: drafts[sectionId].enabled,
        values: parsedValues
      }

      const response = await updateSystemConfigSection(sectionId, payload)
      setConfig(response.config)
      toast.success(`${sectionId} settings saved`)
    } catch (error) {
      toast.error(error?.response?.data?.message || `Failed to save ${sectionId} settings`)
    } finally {
      setSavingSection('')
    }
  }

  return (
    <div>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Settings</h2>
        <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Admin configuration center</p>
      </div>

      {loading ? (
        <div className='rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5'>
          <p className='text-gray-700 dark:text-gray-300'>Loading settings...</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {settingsSections.map((section) => (
            <div key={section.id} className='rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>{section.title}</h3>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>{section.description}</p>

              <div className='mt-4 flex items-center gap-2'>
                <input
                  id={`enabled-${section.id}`}
                  type='checkbox'
                  checked={!!drafts[section.id]?.enabled}
                  onChange={(e) => handleDraftChange(section.id, 'enabled', e.target.checked)}
                  className='rounded border-gray-300 text-accent focus:ring-accent'
                />
                <label htmlFor={`enabled-${section.id}`} className='text-sm text-gray-700 dark:text-gray-300'>
                  Enabled
                </label>
              </div>

              <div className='mt-4'>
                <label className='block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1'>Values (JSON)</label>
                <textarea
                  rows={8}
                  value={drafts[section.id]?.valuesText || '{}'}
                  onChange={(e) => handleDraftChange(section.id, 'valuesText', e.target.value)}
                  className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent font-mono text-xs'
                />
              </div>

              <div className='mt-4 text-xs text-gray-500 dark:text-gray-400'>Last updated: {sectionMap[section.id]?.updatedAt ? new Date(sectionMap[section.id].updatedAt).toLocaleString() : 'N/A'}</div>

              <button onClick={() => handleSaveSection(section.id)} disabled={savingSection === section.id} className='mt-4 px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-60'>
                {savingSection === section.id ? 'Saving...' : 'Save Section'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminSettings
