export const DEFAULT_SETTINGS_SECTION = 'home.layout'

export const SETTINGS_GROUPS = [
  {
    id: 'site-builder',
    label: 'Site Builder',
    items: [
      {
        label: 'Home Page',
        children: [
          { id: 'home.layout', label: 'Layout Settings' },
          { id: 'home.content', label: 'Main Content Block' },
          { id: 'home.testimonials', label: 'Testimonials Block' },
          { id: 'home.pricing', label: 'Pricing Block' }
        ]
      },
      { id: 'blog', label: 'Blog Page' },
      { id: 'blog-detail', label: 'Blog Detail Page' },
      { id: 'listings', label: 'Listings Page' },
      { id: 'project-detail', label: 'Project Detail Page' },
      {
        label: 'About Page',
        children: [
          { id: 'about.layout', label: 'Layout Settings' },
          { id: 'about.content', label: 'Content Block' }
        ]
      },
      { id: 'contact', label: 'Contact Page' }
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
  'home.layout': {
    pageTitle: 'Home Page',
    pageDescription: 'Manage Home page layout, visibility, and presentation settings.',
    sectionId: 'home',
    sectionTitle: 'Layout Settings',
    sectionDescription: 'Configure layout presets, page height, section visibility, and other presentation controls.'
  },
  'home.content': {
    pageTitle: 'Home Page',
    pageDescription: 'Manage Home page copy and labels for the main sections.',
    sectionId: 'home',
    sectionTitle: 'Main Content Block',
    sectionDescription: 'Edit hero, features, how-it-works, and contact copy used on the Home page.'
  },
  'home.pricing': {
    pageTitle: 'Home Page',
    pageDescription: 'Manage pricing block content and plan structure used on the Home page.',
    sectionId: 'pricing',
    sectionTitle: 'Pricing Block',
    sectionDescription: 'Edit pricing section headings and plan content.'
  },
  'home.testimonials': {
    pageTitle: 'Home Page',
    pageDescription: 'Manage testimonials block content shown on the Home page.',
    sectionId: 'testimonials',
    sectionTitle: 'Testimonials Block',
    sectionDescription: 'Edit testimonial headings, cards, and supporting content.'
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
  'about.layout': {
    pageTitle: 'About Page',
    pageDescription: 'Manage About page layout, section visibility, and presentation settings.',
    sectionId: 'about',
    sectionTitle: 'Layout Settings',
    sectionDescription: 'Control About page hero presentation, block visibility, and backgrounds.'
  },
  'about.content': {
    pageTitle: 'About Page',
    pageDescription: 'Manage About page copy and messaging.',
    sectionId: 'about',
    sectionTitle: 'Content Block',
    sectionDescription: 'Edit the public About page headline, subheadline, mission, and vision content.'
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

export const SETTINGS_VIEW_REGISTRY = [
  {
    id: 'home.layout',
    groupId: 'site-builder',
    pageTitle: 'Home Page',
    pageDescription: 'Manage Home page layout, visibility, and presentation settings.',
    sectionId: 'home',
    sectionTitle: 'Layout Settings',
    sectionDescription: 'Configure layout presets, page height, section visibility, and other presentation controls.',
    isImplemented: true
  },
  {
    id: 'home.content',
    groupId: 'site-builder',
    pageTitle: 'Home Page',
    pageDescription: 'Manage Home page copy and labels for the main sections.',
    sectionId: 'home',
    sectionTitle: 'Main Content Block',
    sectionDescription: 'Edit hero, features, how-it-works, and contact copy used on the Home page.',
    isImplemented: true
  },
  {
    id: 'home.pricing',
    groupId: 'site-builder',
    pageTitle: 'Home Page',
    pageDescription: 'Manage pricing block content and plan structure used on the Home page.',
    sectionId: 'pricing',
    sectionTitle: 'Pricing Block',
    sectionDescription: 'Edit pricing section headings and plan content.',
    isImplemented: true
  },
  {
    id: 'home.testimonials',
    groupId: 'site-builder',
    pageTitle: 'Home Page',
    pageDescription: 'Manage testimonials block content shown on the Home page.',
    sectionId: 'testimonials',
    sectionTitle: 'Testimonials Block',
    sectionDescription: 'Edit testimonial headings, cards, and supporting content.',
    isImplemented: true
  },
  {
    id: 'blog',
    groupId: 'site-builder',
    pageTitle: 'Site Builder',
    pageDescription: 'Manage public Blog page content and layout-facing labels.',
    sectionId: 'blog',
    isImplemented: true
  },
  {
    id: 'blog-detail',
    groupId: 'site-builder',
    pageTitle: 'Site Builder',
    pageDescription: 'Blog detail page settings will be added here next.',
    sectionId: 'blog-detail',
    isImplemented: false
  },
  {
    id: 'listings',
    groupId: 'site-builder',
    pageTitle: 'Site Builder',
    pageDescription: 'Listings page settings will be added here next.',
    sectionId: 'listings',
    isImplemented: false
  },
  {
    id: 'project-detail',
    groupId: 'site-builder',
    pageTitle: 'Site Builder',
    pageDescription: 'Project detail page settings will be added here next.',
    sectionId: 'project-detail',
    isImplemented: false
  },
  {
    id: 'about.layout',
    groupId: 'site-builder',
    pageTitle: 'About Page',
    pageDescription: 'Manage About page layout, section visibility, and presentation settings.',
    sectionId: 'about',
    sectionTitle: 'Layout Settings',
    sectionDescription: 'Control About page hero presentation, block visibility, and backgrounds.'
    isImplemented: true
  },
  {
    id: 'about.content',
    groupId: 'site-builder',
    pageTitle: 'About Page',
    pageDescription: 'Manage About page copy and messaging.',
    sectionId: 'about',
    sectionTitle: 'Content Block',
    sectionDescription: 'Edit the public About page headline, subheadline, mission, and vision content.',
    isImplemented: true
  },
  {
    id: 'contact',
    groupId: 'site-builder',
    pageTitle: 'Site Builder',
    pageDescription: 'Manage platform contact content and support details.',
    sectionId: 'contact',
    isImplemented: true
  },
  {
    id: 'mail',
    groupId: 'platform-settings',
    pageTitle: 'Platform Settings',
    pageDescription: 'Configure mail-related platform settings.',
    sectionId: 'mail',
    isImplemented: true
  },
  {
    id: 'system',
    groupId: 'platform-settings',
    pageTitle: 'Platform Settings',
    pageDescription: 'General platform settings and admin defaults.',
    sectionId: 'system',
    isImplemented: true
  }
]
