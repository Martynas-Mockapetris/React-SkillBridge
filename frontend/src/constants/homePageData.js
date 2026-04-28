export const HOME_FEATURES = [
  {
    iconKey: 'handshake',
    title: 'Professional Network',
    description: 'Connect with industry experts and build meaningful professional relationships'
  },
  {
    iconKey: 'rocket',
    title: 'Quality Projects',
    description: 'Access hand-picked opportunities that match your expertise'
  },
  {
    iconKey: 'chartLine',
    title: 'Skill Development',
    description: 'Grow your expertise through real-world projects and experiences'
  },
  {
    iconKey: 'clock',
    title: 'Flexible Work',
    description: 'Choose projects that fit your schedule and work preferences'
  },
  {
    iconKey: 'globe',
    title: 'Global Opportunities',
    description: 'Access projects and talent from around the world'
  },
  {
    iconKey: 'shieldAlt',
    title: 'Verified Reviews',
    description: 'Make informed decisions with authentic feedback and ratings'
  }
]

export const HOME_TALENT_STEPS = [
  {
    number: '01',
    title: 'Create Profile',
    description: 'Set up your professional profile highlighting your skills and experience',
    iconKey: 'userCircle'
  },
  {
    number: '02',
    title: 'Browse Opportunities',
    description: 'Explore curated projects that match your expertise and interests',
    iconKey: 'search'
  },
  {
    number: '03',
    title: 'Start Working',
    description: 'Connect with clients and begin your successful collaboration',
    iconKey: 'handshake'
  }
]

export const HOME_CLIENT_STEPS = [
  {
    number: '01',
    title: 'Post Project',
    description: 'Share your project details and requirements with our talented community',
    iconKey: 'fileAlt'
  },
  {
    number: '02',
    title: 'Review Candidates',
    description: 'Browse through qualified professionals and select the perfect match',
    iconKey: 'userCheck'
  },
  {
    number: '03',
    title: 'Hire Talent',
    description: 'Start collaborating with your chosen professional on your project',
    iconKey: 'checkCircle'
  }
]

export const DEFAULT_PRICING_PLANS = [
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

export const DEFAULT_PRICING_LAYOUT = {
  cardDensity: 'balanced',
  emphasisStyle: 'subtle',
  featuredPlanPresentation: 'badge'
}

export const DEFAULT_TESTIMONIALS = [
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
