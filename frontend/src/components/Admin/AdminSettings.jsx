import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { getSystemConfig, updateSystemConfigSection } from '../../services/configService'

const SECTION_DEFS = {
  home: {
    title: 'Home Page',
    description: 'Manage public text content for the Home page sections.',
    fields: [
      { key: 'heroTitleLead', label: 'Hero Title (Lead)', type: 'text', placeholder: 'Find Your Next' },
      { key: 'heroTitleAccent', label: 'Hero Title (Accent)', type: 'text', placeholder: 'Opportunity' },
      { key: 'heroDescriptionLine1', label: 'Hero Description Line 1', type: 'text', placeholder: 'Connect with top talent and clients worldwide on our platform.' },
      { key: 'heroDescriptionLine2', label: 'Hero Description Line 2', type: 'text', placeholder: 'Start your success story today.' },
      { key: 'heroTalentButton', label: 'Hero Talent Button', type: 'text', placeholder: 'Find Talent' },
      { key: 'heroWorkButton', label: 'Hero Work Button', type: 'text', placeholder: 'Find Work' },
      { key: 'featuresTitleLead', label: 'Features Title (Lead)', type: 'text', placeholder: 'Why Choose' },
      { key: 'featuresTitleAccent', label: 'Features Title (Accent)', type: 'text', placeholder: 'SkillBridge' },
      { key: 'featuresSubtitle', label: 'Features Subtitle', type: 'textarea', placeholder: 'Discover the advantages that make SkillBridge the preferred platform for connecting talent with opportunities' },
      { key: 'howTitleLead', label: 'How It Works Title (Lead)', type: 'text', placeholder: 'How' },
      { key: 'howTitleAccent', label: 'How It Works Title (Accent)', type: 'text', placeholder: 'It Works' },
      { key: 'howSubtitle', label: 'How It Works Subtitle', type: 'textarea', placeholder: 'Choose your path and discover how SkillBridge works for you' },
      { key: 'talentTabLabel', label: 'How It Works Talent Tab Label', type: 'text', placeholder: 'For Talent' },
      { key: 'clientTabLabel', label: 'How It Works Client Tab Label', type: 'text', placeholder: 'For Clients' },
      { key: 'testimonialsTitleLead', label: 'Testimonials Title (Lead)', type: 'text', placeholder: 'What Our' },
      { key: 'testimonialsTitleAccent', label: 'Testimonials Title (Accent)', type: 'text', placeholder: 'Clients Say' },
      { key: 'testimonialsSubtitle', label: 'Testimonials Subtitle', type: 'textarea', placeholder: 'Discover how our platform has transformed businesses and careers through real success stories' },
      { key: 'pricingTitleLead', label: 'Pricing Title (Lead)', type: 'text', placeholder: 'Flexible' },
      { key: 'pricingTitleAccent', label: 'Pricing Title (Accent)', type: 'text', placeholder: 'Pricing' },
      { key: 'pricingSubtitle', label: 'Pricing Subtitle', type: 'textarea', placeholder: 'Choose the perfect plan that suits your needs and budget' },
      { key: 'contactTitleLead', label: 'Contact Title (Lead)', type: 'text', placeholder: 'Get In' },
      { key: 'contactTitleAccent', label: 'Contact Title (Accent)', type: 'text', placeholder: 'Touch' },
      { key: 'contactSubtitle', label: 'Contact Subtitle', type: 'textarea', placeholder: "Have a question or want to collaborate? Drop us a message, and we'll get back to you soon." }
    ]
  },
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

const HOME_FIELD_GROUPS = [
  {
    title: 'Hero Section',
    keys: ['heroTitleLead', 'heroTitleAccent', 'heroDescriptionLine1', 'heroDescriptionLine2', 'heroTalentButton', 'heroWorkButton']
  },
  {
    title: 'Features Section',
    keys: ['featuresTitleLead', 'featuresTitleAccent', 'featuresSubtitle']
  },
  {
    title: 'How It Works Section',
    keys: ['howTitleLead', 'howTitleAccent', 'howSubtitle', 'talentTabLabel', 'clientTabLabel']
  },
  {
    title: 'Testimonials Section',
    keys: ['testimonialsTitleLead', 'testimonialsTitleAccent', 'testimonialsSubtitle']
  },
  {
    title: 'Pricing Section',
    keys: ['pricingTitleLead', 'pricingTitleAccent', 'pricingSubtitle']
  },
  {
    title: 'Contact Section',
    keys: ['contactTitleLead', 'contactTitleAccent', 'contactSubtitle']
  }
]

const initialDrafts = {
  home: { enabled: true, values: {} },
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
      home: config.home || {},
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
          home: { enabled: data?.home?.enabled ?? true, values: data?.home?.values || {} },
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

  const renderField = (sectionId, field) => (
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
  )

  const renderSectionFields = (sectionId, section) => {
    if (sectionId !== 'home') {
      return <div className='mt-4 space-y-3'>{section.fields.map((field) => renderField(sectionId, field))}</div>
    }

    return (
      <div className='mt-4 space-y-4'>
        {HOME_FIELD_GROUPS.map((group) => {
          const groupFields = section.fields.filter((field) => group.keys.includes(field.key))
          if (!groupFields.length) return null

          return (
            <div key={group.title} className='rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 p-4'>
              <h4 className='text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3'>{group.title}</h4>
              <div className='space-y-3'>{groupFields.map((field) => renderField(sectionId, field))}</div>
            </div>
          )
        })}
      </div>
    )
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

              {renderSectionFields(sectionId, section)}

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
