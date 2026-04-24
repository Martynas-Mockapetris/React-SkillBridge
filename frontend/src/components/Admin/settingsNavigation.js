export const DEFAULT_SETTINGS_SECTION = 'home.hero'

export const SETTINGS_GROUPS = [
  {
    id: 'site-builder',
    label: 'Site Builder',
    items: [
      { id: 'home.hero', label: 'Home Hero' },
      { id: 'blog', label: 'Blog Page' },
      { id: 'blog-detail', label: 'Blog Detail Page' },
      { id: 'listings', label: 'Listings Page' },
      { id: 'project-detail', label: 'Project Detail Page' },
      { id: 'about', label: 'About Page' },
      { id: 'contact', label: 'Contact Page' }
    ]
  },
  {
    id: 'shared-blocks',
    label: 'Shared Blocks',
    items: [
      { id: 'home.pricing', label: 'Pricing Block' },
      { id: 'home.testimonials', label: 'Testimonials Block' }
    ]
  },
  {
    id: 'platform-settings',
    label: 'Platform Settings',
    items: [
      { id: 'mail', label: 'Mail Settings' },
      { id: 'system', label: 'System Settings' }
    ]
  }
]

export const SETTINGS_VIEW_MAP = {
  'home.hero': {
    pageTitle: 'Site Builder',
    pageDescription: 'Manage the main Home hero content and entry layout settings.',
    sectionId: 'home'
  },
  'home.pricing': {
    pageTitle: 'Shared Blocks',
    pageDescription: 'Manage reusable pricing block content and plan structure.',
    sectionId: 'pricing'
  },
  'home.testimonials': {
    pageTitle: 'Shared Blocks',
    pageDescription: 'Manage reusable testimonials content and card structure.',
    sectionId: 'testimonials'
  },
  blog: {
    pageTitle: 'Site Builder',
    pageDescription: 'Manage public Blog page content and layout-facing labels.',
    sectionId: 'blog'
  },
  'blog-detail': {
    pageTitle: 'Site Builder',
    pageDescription: 'Blog detail page settings will be added here next.',
    sectionId: 'blog-detail'
  },
  listings: {
    pageTitle: 'Site Builder',
    pageDescription: 'Listings page settings will be added here next.',
    sectionId: 'listings'
  },
  'project-detail': {
    pageTitle: 'Site Builder',
    pageDescription: 'Project detail page settings will be added here next.',
    sectionId: 'project-detail'
  },
  about: {
    pageTitle: 'Site Builder',
    pageDescription: 'Manage About page content and visibility settings.',
    sectionId: 'about'
  },
  contact: {
    pageTitle: 'Site Builder',
    pageDescription: 'Manage platform contact content and support details.',
    sectionId: 'contact'
  },
  mail: {
    pageTitle: 'Platform Settings',
    pageDescription: 'Configure mail-related platform settings.',
    sectionId: 'mail'
  },
  system: {
    pageTitle: 'Platform Settings',
    pageDescription: 'General platform settings and admin defaults.',
    sectionId: 'system'
  }
}
