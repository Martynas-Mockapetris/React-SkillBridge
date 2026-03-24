import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { getSystemConfig, updateSystemConfigSection } from '../../services/configService'

const SECTION_DEFS = {
  about: {
    title: 'About Page',
    description: 'Manage About page content and visibility settings.',
    fields: [
      { key: 'headline', label: 'Headline', type: 'text', placeholder: 'Build your freelance career with confidence' },
      { key: 'subheadline', label: 'Subheadline', type: 'text', placeholder: 'Connect clients and freelancers in one place' },
      { key: 'mission', label: 'Mission', type: 'textarea', placeholder: 'Describe mission...' },
      { key: 'vision', label: 'Vision', type: 'textarea', placeholder: 'Describe vision...' }
    ]
  },
  contact: {
    title: 'Contact Info',
    description: 'Manage platform contact channels and support details.',
    fields: [
      { key: 'supportEmail', label: 'Support Email', type: 'email', placeholder: 'support@skillbridge.com' },
      { key: 'businessEmail', label: 'Business Email', type: 'email', placeholder: 'business@skillbridge.com' },
      { key: 'phone', label: 'Phone', type: 'text', placeholder: '+370...' },
      { key: 'address', label: 'Address', type: 'text', placeholder: 'City, Country' },
      { key: 'workingHours', label: 'Working Hours', type: 'text', placeholder: 'Mon-Fri 09:00-18:00' }
    ]
  },
  mail: {
    title: 'Mail Settings',
    description: 'Configure mail defaults shown to users.',
    fields: [
      { key: 'senderName', label: 'Sender Name', type: 'text', placeholder: 'SkillBridge Team' },
      { key: 'senderEmail', label: 'Sender Email', type: 'email', placeholder: 'noreply@skillbridge.com' },
      { key: 'replyTo', label: 'Reply-To Email', type: 'email', placeholder: 'support@skillbridge.com' },
      { key: 'footerText', label: 'Mail Footer Text', type: 'textarea', placeholder: 'Thanks for using SkillBridge...' }
    ]
  },
  system: {
    title: 'System Settings',
    description: 'General platform settings and admin defaults.',
    fields: [
      { key: 'platformName', label: 'Platform Name', type: 'text', placeholder: 'SkillBridge' },
      { key: 'defaultLanguage', label: 'Default Language', type: 'text', placeholder: 'en' },
      { key: 'timezone', label: 'Timezone', type: 'text', placeholder: 'Europe/Vilnius' },
      { key: 'maintenanceMessage', label: 'Maintenance Message', type: 'textarea', placeholder: 'We are updating the platform...' }
    ]
  }
}

const initialDrafts = {
  about: { enabled: true, values: {} },
  contact: { enabled: true, values: {} },
  mail: { enabled: true, values: {} },
  system: { enabled: true, values: {} }
}

const AdminSettings = () => {
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState(null)
  const [savingSection, setSavingSection] = useState('')
  const [drafts, setDrafts] = useState(initialDrafts)

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
          about: { enabled: data?.about?.enabled ?? true, values: data?.about?.values || {} },
          contact: { enabled: data?.contact?.enabled ?? true, values: data?.contact?.values || {} },
          mail: { enabled: data?.mail?.enabled ?? true, values: data?.mail?.values || {} },
          system: { enabled: data?.system?.enabled ?? true, values: data?.system?.values || {} }
        })
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  const handleEnabledChange = (sectionId, enabled) => {
    setDrafts((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        enabled
      }
    }))
  }

  const handleFieldChange = (sectionId, key, value) => {
    setDrafts((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        values: {
          ...prev[sectionId].values,
          [key]: value
        }
      }
    }))
  }

  const handleSaveSection = async (sectionId) => {
    try {
      setSavingSection(sectionId)

      const payload = {
        enabled: drafts[sectionId].enabled,
        values: drafts[sectionId].values
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
          {Object.entries(SECTION_DEFS).map(([sectionId, section]) => (
            <div key={sectionId} className='rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>{section.title}</h3>
              <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>{section.description}</p>

              <div className='mt-4 flex items-center gap-2'>
                <input
                  id={`enabled-${sectionId}`}
                  type='checkbox'
                  checked={!!drafts[sectionId]?.enabled}
                  onChange={(e) => handleEnabledChange(sectionId, e.target.checked)}
                  className='rounded border-gray-300 text-accent focus:ring-accent'
                />
                <label htmlFor={`enabled-${sectionId}`} className='text-sm text-gray-700 dark:text-gray-300'>
                  Enabled
                </label>
              </div>

              <div className='mt-4 space-y-3'>
                {section.fields.map((field) => (
                  <div key={field.key}>
                    <label className='block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1'>{field.label}</label>

                    {field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={drafts[sectionId]?.values?.[field.key] || ''}
                        onChange={(e) => handleFieldChange(sectionId, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent resize-none'
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={drafts[sectionId]?.values?.[field.key] || ''}
                        onChange={(e) => handleFieldChange(sectionId, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className='mt-4 text-xs text-gray-500 dark:text-gray-400'>Last updated: {sectionMap[sectionId]?.updatedAt ? new Date(sectionMap[sectionId].updatedAt).toLocaleString() : 'N/A'}</div>

              <button onClick={() => handleSaveSection(sectionId)} disabled={savingSection === sectionId} className='mt-4 px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-60'>
                {savingSection === sectionId ? 'Saving...' : 'Save Section'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminSettings