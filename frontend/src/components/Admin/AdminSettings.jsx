import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { getSystemConfig, updateSystemConfigSection } from '../../services/configService'

const SECTION_DEFS = {
  home: {
    title: 'Hero Sections',
    description: 'Manage hero and core Home page section content.',
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
      { key: 'contactTitleLead', label: 'Contact Title (Lead)', type: 'text', placeholder: 'Get In' },
      { key: 'contactTitleAccent', label: 'Contact Title (Accent)', type: 'text', placeholder: 'Touch' },
      { key: 'contactSubtitle', label: 'Contact Subtitle', type: 'textarea', placeholder: "Have a question or want to collaborate? Drop us a message, and we'll get back to you soon." }
    ]
  },
  pricing: {
    title: 'Pricing',
    description: 'Manage pricing section title and plans.',
    fields: [
      { key: 'pricingTitleLead', label: 'Title Lead', type: 'text', placeholder: 'Flexible' },
      { key: 'pricingTitleAccent', label: 'Title Accent', type: 'text', placeholder: 'Pricing' },
      { key: 'pricingSubtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Choose the perfect plan that suits your needs and budget' }
    ]
  },
  testimonials: {
    title: 'Testimonials',
    description: 'Manage testimonials section title and cards.',
    fields: [
      { key: 'testimonialsTitleLead', label: 'Title Lead', type: 'text', placeholder: 'What Our' },
      { key: 'testimonialsTitleAccent', label: 'Title Accent', type: 'text', placeholder: 'Clients Say' },
      { key: 'testimonialsSubtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Discover how our platform has transformed businesses and careers through real success stories' }
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
    title: 'Contact Section',
    keys: ['contactTitleLead', 'contactTitleAccent', 'contactSubtitle']
  }
]

const DEFAULT_PRICING_PLANS = [
  {
    title: 'Basic',
    price: 'Free',
    period: '',
    description: 'Perfect for exploring the platform',
    users: '8.4k',
    isRecommended: false,
    badgeText: '',
    buttonLabel: 'Get Started',
    features: ['Browse projects/freelancers', 'Basic profile creation', 'Limited project posts', 'Community access']
  },
  {
    title: 'Creator Premium',
    price: '€19.99',
    period: 'month',
    description: 'Perfect for businesses and startups',
    users: '1.2k',
    isRecommended: false,
    badgeText: '',
    buttonLabel: 'Get Started',
    features: ['Unlimited project posts', 'Priority project listing', 'Advanced search filters', 'Direct messaging', 'Verified badge']
  },
  {
    title: 'Freelancer Premium',
    price: '€19.99',
    period: 'month',
    description: 'Perfect for professional freelancers',
    users: '0.8k',
    isRecommended: false,
    badgeText: '',
    buttonLabel: 'Get Started',
    features: ['Featured profile listing', 'Proposal prioritization', 'Skills verification badge', 'Analytics dashboard', 'Client reviews system']
  },
  {
    title: 'Full Package',
    price: '€29.99',
    period: 'month',
    description: 'Perfect for agencies and growing freelancers',
    users: '0.5k',
    isRecommended: true,
    badgeText: 'Recommended',
    buttonLabel: 'Get Started',
    features: ['All Creator Premium features', 'All Freelancer Premium features', 'Team management tools', 'Multiple project handling', 'Collaboration tools']
  }
]

const DEFAULT_TESTIMONIALS = [
  {
    name: 'Emma Wilson',
    role: 'Project Owner',
    content: 'Found the perfect developer for my online store project. The platform made it easy to review portfolios and connect with qualified freelancers.',
    rating: 5,
    avatarSeed: 'emma-wilson'
  },
  {
    name: 'Michael Chen',
    role: 'Freelance Developer',
    content: 'As a freelancer, I love how easy it is to find interesting projects that match my skills. The platform helps me connect with serious clients.',
    rating: 4,
    avatarSeed: 'michael-chen'
  },
  {
    name: 'Sarah Johnson',
    role: 'Project Owner',
    content: 'Posted my app project and received proposals from skilled developers within days. The collaboration tools made the whole process smooth.',
    rating: 5,
    avatarSeed: 'sarah-johnson'
  },
  {
    name: 'David Rodriguez',
    role: 'Freelance Designer',
    content: 'The platform connects me with clients who value quality design. The project matching system is spot on with my expertise.',
    rating: 4.5,
    avatarSeed: 'david-rodriguez'
  },
  {
    name: 'Lisa Chang',
    role: 'Project Owner',
    content: 'Within a week, I found an amazing designer who perfectly understood my brand vision. The collaboration features made communication effortless.',
    rating: 5,
    avatarSeed: 'lisa-chang'
  }
]

const initialDrafts = {
  home: { enabled: true, values: {} },
  pricing: { enabled: true, values: {} },
  testimonials: { enabled: true, values: {} },
  about: { enabled: true, values: {} },
  contact: { enabled: true, values: {} },
  mail: { enabled: true, values: {} },
  system: { enabled: true, values: {} }
}

const SETTINGS_VIEW_MAP = {
  'home.hero': {
    pageTitle: 'Home Page',
    pageDescription: 'Manage all Home page content pages and sections.',
    sectionId: 'home'
  },
  'home.pricing': {
    pageTitle: 'Home Page',
    pageDescription: 'Manage all Home page content pages and sections.',
    sectionId: 'pricing'
  },
  'home.testimonials': {
    pageTitle: 'Home Page',
    pageDescription: 'Manage all Home page content pages and sections.',
    sectionId: 'testimonials'
  },
  about: {
    pageTitle: 'About Page',
    pageDescription: 'Manage About page content and visibility settings.',
    sectionId: 'about'
  },
  contact: {
    pageTitle: 'Contact Info',
    pageDescription: 'Manage platform contact channels and support details.',
    sectionId: 'contact'
  },
  mail: {
    pageTitle: 'Mail Settings',
    pageDescription: 'Configure mail defaults shown to users.',
    sectionId: 'mail'
  },
  system: {
    pageTitle: 'System Settings',
    pageDescription: 'General platform settings and admin defaults.',
    sectionId: 'system'
  }
}

const AdminSettings = ({ activeSectionId = 'home.hero' }) => {
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState(null)
  const [savingSection, setSavingSection] = useState('')
  const [drafts, setDrafts] = useState(initialDrafts)

  const sectionMap = useMemo(() => {
    if (!config) return {}
    return {
      home: config.home || {},
      pricing: config.pricing || {},
      testimonials: config.testimonials || {},
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
          pricing: { enabled: data?.pricing?.enabled ?? true, values: data?.pricing?.values || {} },
          testimonials: { enabled: data?.testimonials?.enabled ?? true, values: data?.testimonials?.values || {} },
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

  const getPricingPlans = () => {
    const plans = drafts?.pricing?.values?.pricingPlans
    return Array.isArray(plans) && plans.length ? plans : DEFAULT_PRICING_PLANS
  }

  const updatePricingPlans = (updater) => {
    setDrafts((prev) => {
      const currentPlans = Array.isArray(prev?.pricing?.values?.pricingPlans) && prev.pricing.values.pricingPlans.length ? prev.pricing.values.pricingPlans : DEFAULT_PRICING_PLANS
      const nextPlans = typeof updater === 'function' ? updater(currentPlans) : updater

      return {
        ...prev,
        pricing: {
          ...prev.pricing,
          values: {
            ...prev.pricing.values,
            pricingPlans: nextPlans
          }
        }
      }
    })
  }

  const handlePricingPlanField = (index, key, value) => {
    updatePricingPlans((plans) => plans.map((plan, i) => (i === index ? { ...plan, [key]: value } : plan)))
  }

  const handlePricingPlanFeatures = (index, value) => {
    const features = value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)

    updatePricingPlans((plans) => plans.map((plan, i) => (i === index ? { ...plan, features } : plan)))
  }

  const addPricingPlan = () => {
    updatePricingPlans((plans) => [
      ...plans,
      {
        title: 'New Plan',
        price: '',
        period: 'month',
        description: '',
        users: '',
        isRecommended: false,
        badgeText: '',
        buttonLabel: 'Get Started',
        features: []
      }
    ])
  }

  const removePricingPlan = (index) => {
    updatePricingPlans((plans) => {
      if (plans.length <= 1) return plans
      return plans.filter((_, i) => i !== index)
    })
  }

  const getTestimonials = () => {
    const testimonials = drafts?.testimonials?.values?.testimonials
    if (!Array.isArray(testimonials) || !testimonials.length) return DEFAULT_TESTIMONIALS
    return [...testimonials, ...DEFAULT_TESTIMONIALS.slice(testimonials.length)]
  }

  const updateTestimonials = (updater) => {
    setDrafts((prev) => {
      const currentTestimonials = Array.isArray(prev?.testimonials?.values?.testimonials) && prev.testimonials.values.testimonials.length ? prev.testimonials.values.testimonials : DEFAULT_TESTIMONIALS
      const nextTestimonials = typeof updater === 'function' ? updater(currentTestimonials) : updater

      return {
        ...prev,
        testimonials: {
          ...prev.testimonials,
          values: {
            ...prev.testimonials.values,
            testimonials: nextTestimonials
          }
        }
      }
    })
  }

  const handleTestimonialField = (index, key, value) => {
    updateTestimonials((items) => items.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  }

  const addTestimonial = () => {
    updateTestimonials((items) => [
      ...items,
      {
        name: 'New Person',
        role: '',
        content: '',
        rating: 5,
        avatarSeed: 'new-person'
      }
    ])
  }

  const removeTestimonial = (index) => {
    updateTestimonials((items) => {
      if (items.length <= 1) return items
      return items.filter((_, i) => i !== index)
    })
  }

  const renderInputControl = (sectionId, field, customLabel) => (
    <div key={field.key}>
      <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap overflow-hidden text-ellipsis'>{customLabel || field.label}</label>

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

  const getCompactHomeLabel = (field) => {
    if (field.key.endsWith('Subtitle')) return 'Subtitle'
    if (field.key === 'talentTabLabel') return 'Talent Tab'
    if (field.key === 'clientTabLabel') return 'Client Tab'
    if (field.key === 'heroDescriptionLine1') return 'Description 1'
    if (field.key === 'heroDescriptionLine2') return 'Description 2'
    return field.label
  }

  const renderField = (sectionId, field) => {
    if (sectionId === 'home') {
      return renderInputControl(sectionId, field, getCompactHomeLabel(field))
    }
    return renderInputControl(sectionId, field)
  }

  const renderHomeGroupFields = (sectionId, groupFields) => {
    const rendered = []
    const used = new Set()

    groupFields.forEach((field) => {
      if (used.has(field.key)) return

      // Render title lead + accent in one row with compact labels.
      if (field.key.endsWith('TitleLead')) {
        const accentKey = field.key.replace('TitleLead', 'TitleAccent')
        const accentField = groupFields.find((f) => f.key === accentKey)

        used.add(field.key)
        if (accentField) used.add(accentField.key)

        rendered.push(
          <div key={`${field.key}-pair`} className='space-y-2'>
            <p className='text-sm font-semibold text-gray-800 dark:text-gray-200'>Title</p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {renderInputControl(sectionId, field, 'Lead')}
              {accentField ? renderInputControl(sectionId, accentField, 'Accent') : null}
            </div>
          </div>
        )
        return
      }

      // Render How It Works tabs in one row.
      if (field.key === 'talentTabLabel') {
        const clientTabField = groupFields.find((f) => f.key === 'clientTabLabel')

        used.add(field.key)
        if (clientTabField) used.add(clientTabField.key)

        rendered.push(
          <div key='how-tabs-row' className='space-y-2'>
            <p className='text-sm font-semibold text-gray-800 dark:text-gray-200'>Tabs</p>
            <div className='grid grid-cols-2 gap-3'>
              {renderInputControl(sectionId, field, 'Talent')}
              {clientTabField ? renderInputControl(sectionId, clientTabField, 'Client') : null}
            </div>
          </div>
        )
        return
      }

      if (field.key === 'heroTalentButton') {
        const workButtonField = groupFields.find((f) => f.key === 'heroWorkButton')

        used.add(field.key)
        if (workButtonField) used.add(workButtonField.key)

        rendered.push(
          <div key='hero-buttons-row' className='space-y-2'>
            <p className='text-sm font-semibold text-gray-800 dark:text-gray-200'>Buttons</p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {renderInputControl(sectionId, field, 'Button')}
              {workButtonField ? renderInputControl(sectionId, workButtonField, 'Button') : null}
            </div>
          </div>
        )
        return
      }

      used.add(field.key)
      rendered.push(renderField(sectionId, field))
    })

    return <div className='space-y-3'>{rendered}</div>
  }

  const renderPricingPlansEditor = () => {
    const plans = getPricingPlans()

    return (
      <div className='mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 p-4'>
        <div className='flex items-center justify-between mb-3'>
          <h5 className='text-sm font-semibold text-gray-900 dark:text-white'>Plans</h5>
          <button type='button' onClick={addPricingPlan} className='px-3 py-1.5 text-xs rounded-md bg-accent text-white hover:bg-accent/90'>
            Add Plan
          </button>
        </div>

        <div className='space-y-4'>
          {plans.map((plan, index) => (
            <div key={index} className='rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 p-3 space-y-3'>
              <div className='flex items-center justify-between'>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>Plan {index + 1}</p>
                <button type='button' onClick={() => removePricingPlan(index)} className='px-2 py-1 text-xs rounded-md border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'>
                  Remove
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap'>Title</label>
                  <input
                    type='text'
                    value={plan.title || ''}
                    onChange={(e) => handlePricingPlanField(index, 'title', e.target.value)}
                    className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap'>Price</label>
                  <input
                    type='text'
                    value={plan.price || ''}
                    onChange={(e) => handlePricingPlanField(index, 'price', e.target.value)}
                    className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap'>Period</label>
                  <input
                    type='text'
                    value={plan.period || ''}
                    onChange={(e) => handlePricingPlanField(index, 'period', e.target.value)}
                    placeholder='month'
                    className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
                  />
                </div>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap'>Description</label>
                <input
                  type='text'
                  value={plan.description || ''}
                  onChange={(e) => handlePricingPlanField(index, 'description', e.target.value)}
                  className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap'>Users</label>
                  <input
                    type='text'
                    value={plan.users || ''}
                    onChange={(e) => handlePricingPlanField(index, 'users', e.target.value)}
                    className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap'>Badge</label>
                  <input
                    type='text'
                    value={plan.badgeText || ''}
                    onChange={(e) => handlePricingPlanField(index, 'badgeText', e.target.value)}
                    placeholder='Recommended'
                    className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap'>Button</label>
                  <input
                    type='text'
                    value={plan.buttonLabel || ''}
                    onChange={(e) => handlePricingPlanField(index, 'buttonLabel', e.target.value)}
                    className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
                  />
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={!!plan.isRecommended}
                  onChange={(e) => handlePricingPlanField(index, 'isRecommended', e.target.checked)}
                  className='rounded border-gray-300 text-accent focus:ring-accent'
                />
                <label className='text-xs font-semibold text-gray-600 dark:text-gray-300'>Recommended</label>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap'>Features (one per line)</label>
                <textarea
                  rows={4}
                  value={(plan.features || []).join('\n')}
                  onChange={(e) => handlePricingPlanFeatures(index, e.target.value)}
                  className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent resize-none'
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderTestimonialsEditor = () => {
    const testimonials = getTestimonials()

    return (
      <div className='mt-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 p-4'>
        <div className='flex items-center justify-between mb-3'>
          <h5 className='text-sm font-semibold text-gray-900 dark:text-white'>Testimonials</h5>
          <button type='button' onClick={addTestimonial} className='px-3 py-1.5 text-xs rounded-md bg-accent text-white hover:bg-accent/90'>
            Add Testimonial
          </button>
        </div>

        <div className='space-y-4'>
          {testimonials.map((item, index) => (
            <div key={index} className='rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 p-3 space-y-3'>
              <div className='flex items-center justify-between'>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'>Card {index + 1}</p>
                <button type='button' onClick={() => removeTestimonial(index)} className='px-2 py-1 text-xs rounded-md border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'>
                  Remove
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap'>Name</label>
                  <input
                    type='text'
                    value={item.name || ''}
                    onChange={(e) => handleTestimonialField(index, 'name', e.target.value)}
                    className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap'>Role</label>
                  <input
                    type='text'
                    value={item.role || ''}
                    onChange={(e) => handleTestimonialField(index, 'role', e.target.value)}
                    className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
                  />
                </div>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap'>Content</label>
                <textarea
                  rows={4}
                  value={item.content || ''}
                  onChange={(e) => handleTestimonialField(index, 'content', e.target.value)}
                  className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent resize-none'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap'>Rating (1-5)</label>
                  <input
                    type='number'
                    min='1'
                    max='5'
                    value={item.rating ?? 5}
                    onChange={(e) => {
                      const parsed = Number(e.target.value)
                      const safeRating = Number.isNaN(parsed) ? 5 : Math.min(5, Math.max(1, parsed))
                      handleTestimonialField(index, 'rating', safeRating)
                    }}
                    className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap'>Avatar Seed</label>
                  <input
                    type='text'
                    value={item.avatarSeed || ''}
                    onChange={(e) => handleTestimonialField(index, 'avatarSeed', e.target.value)}
                    placeholder='jane-doe'
                    className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderSectionFields = (sectionId, section) => {
    if (sectionId === 'home') {
      return (
        <div className='mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4'>
          {HOME_FIELD_GROUPS.map((group) => {
            const groupFields = section.fields.filter((field) => group.keys.includes(field.key))
            if (!groupFields.length) return null

            return (
              <div key={group.title} className='rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/40 p-4'>
                <h4 className='text-lg font-bold text-gray-900 dark:text-white mb-3'>{group.title}</h4>
                {renderHomeGroupFields(sectionId, groupFields)}
              </div>
            )
          })}
        </div>
      )
    }

    if (sectionId === 'pricing') {
      return (
        <div className='mt-4 space-y-4'>
          <div className='space-y-3'>{section.fields.map((field) => renderField(sectionId, field))}</div>
          {renderPricingPlansEditor()}
        </div>
      )
    }

    if (sectionId === 'testimonials') {
      return (
        <div className='mt-4 space-y-4'>
          <div className='space-y-3'>{section.fields.map((field) => renderField(sectionId, field))}</div>
          {renderTestimonialsEditor()}
        </div>
      )
    }

    return <div className='mt-4 space-y-3'>{section.fields.map((field) => renderField(sectionId, field))}</div>
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
        <div>
          {(() => {
            const activeView = SETTINGS_VIEW_MAP[activeSectionId] || SETTINGS_VIEW_MAP['home.hero']
            const sectionId = activeView.sectionId
            const section = SECTION_DEFS[sectionId]
            if (!section) return null

            return (
              <div className='rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5'>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div>
                    <p className='text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-2'>{activeView.pageTitle}</p>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>{section.title}</h3>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>{activeView.pageDescription}</p>
                  </div>
                </div>

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

                <div className='mt-4 flex flex-wrap items-center gap-2'>
                  <button onClick={() => handleSaveSection(sectionId)} disabled={savingSection === sectionId} className='px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-60'>
                    {savingSection === sectionId ? 'Saving...' : 'Save Section'}
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default AdminSettings
