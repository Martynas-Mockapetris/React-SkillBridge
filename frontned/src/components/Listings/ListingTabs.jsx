import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaUser, FaBriefcase } from 'react-icons/fa'
import ProjectCard from './ProjectCard'
import FreelancerCard from './FreelancerCard'
import CardLoader from './CardLoader'
import molecularPattern from '../../assets/molecular-pattern.svg'

const ListingTabs = () => {
  const [activeTab, setActiveTab] = useState('projects')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Dummy data for projects and freelancers
  const projectsData = [
    {
      id: 1,
      name: 'E-Commerce Platform Redesign',
      type: 'Full-Stack',
      deadline: '2024-03-15',
      announcer: {
        name: 'Sarah Chen',
        image: 'https://i.pravatar.cc/150?img=1',
        rating: 4.8
      }
    },
    {
      id: 2,
      name: 'Mobile Banking App',
      type: 'Frontend',
      deadline: '2024-04-01',
      announcer: {
        name: 'James Wilson',
        image: 'https://i.pravatar.cc/150?img=2',
        rating: 4.9
      }
    },
    {
      id: 3,
      name: 'Healthcare Dashboard',
      type: 'UX/UI',
      deadline: '2024-03-30',
      announcer: {
        name: 'James Thompson',
        image: 'https://i.pravatar.cc/150?img=3',
        rating: 4.7
      }
    },
    {
      id: 4,
      name: 'Social Media Analytics Tool',
      type: 'Backend',
      deadline: '2024-04-15',
      announcer: {
        name: 'Michael Brown',
        image: 'https://i.pravatar.cc/150?img=4',
        rating: 4.6
      }
    },
    {
      id: 5,
      name: 'Real Estate Platform',
      type: 'Full-Stack',
      deadline: '2024-05-01',
      announcer: {
        name: 'Sofia Garcia',
        image: 'https://i.pravatar.cc/150?img=5',
        rating: 4.9
      }
    },
    {
      id: 6,
      name: 'Fitness Tracking App',
      type: 'Frontend',
      deadline: '2024-04-20',
      announcer: {
        name: 'David Kim',
        image: 'https://i.pravatar.cc/150?img=6',
        rating: 4.8
      }
    },
    {
      id: 7,
      name: 'Educational Platform',
      type: 'Full-Stack',
      deadline: '2024-05-15',
      announcer: {
        name: 'Brian Anderson',
        image: 'https://i.pravatar.cc/150?img=7',
        rating: 4.7
      }
    },
    {
      id: 8,
      name: 'Restaurant Booking System',
      type: 'Backend',
      deadline: '2024-04-10',
      announcer: {
        name: 'Alex Martinez',
        image: 'https://i.pravatar.cc/150?img=8',
        rating: 4.9
      }
    },
    {
      id: 9,
      name: 'Travel App Design',
      type: 'UX/UI',
      deadline: '2024-03-25',
      announcer: {
        name: 'Rachel Lee',
        image: 'https://i.pravatar.cc/150?img=9',
        rating: 4.8
      }
    },
    {
      id: 10,
      name: 'Project Management Tool',
      type: 'Full-Stack',
      deadline: '2024-05-30',
      announcer: {
        name: 'Sara Wright',
        image: 'https://i.pravatar.cc/150?img=10',
        rating: 4.6
      }
    },
    {
      id: 11,
      name: 'Music Streaming Service',
      type: 'Frontend',
      deadline: '2024-04-25',
      announcer: {
        name: 'Dev Patel',
        image: 'https://i.pravatar.cc/150?img=11',
        rating: 4.7
      }
    },
    {
      id: 12,
      name: 'AI Content Generator',
      type: 'Backend',
      deadline: '2024-05-10',
      announcer: {
        name: 'Chris Johnson',
        image: 'https://i.pravatar.cc/150?img=12',
        rating: 4.8
      }
    }
  ]

  const freelancersData = [
    {
      id: 1,
      name: 'Emma Thompson',
      specialty: 'Full-Stack Developer',
      rating: 4.9,
      hourlyRate: '€65/hr',
      image: 'https://i.pravatar.cc/150?img=1',
      completedProjects: 6
    },
    {
      id: 2,
      name: 'Marcus Chen',
      specialty: 'UI/UX Designer',
      rating: 4.8,
      hourlyRate: '€55/hr',
      image: 'https://i.pravatar.cc/150?img=2',
      completedProjects: 9
    },
    {
      id: 3,
      name: 'Sofia Rodriguez',
      specialty: 'Frontend Developer',
      rating: 4.9,
      hourlyRate: '€60/hr',
      image: 'https://i.pravatar.cc/150?img=3',
      completedProjects: 34
    },
    {
      id: 4,
      name: 'Alex Kumar',
      specialty: 'Backend Developer',
      rating: 4.7,
      hourlyRate: '€70/hr',
      image: 'https://i.pravatar.cc/150?img=4',
      completedProjects: 8
    },
    {
      id: 5,
      name: 'Laura Mitchell',
      specialty: 'Mobile Developer',
      rating: 4.8,
      hourlyRate: '€75/hr',
      image: 'https://i.pravatar.cc/150?img=5',
      completedProjects: 27
    },
    {
      id: 6,
      name: 'David Park',
      specialty: 'DevOps Engineer',
      rating: 4.9,
      hourlyRate: '€80/hr',
      image: 'https://i.pravatar.cc/150?img=6',
      completedProjects: 45
    },
    {
      id: 7,
      name: 'Nina Patel',
      specialty: 'Data Scientist',
      rating: 4.8,
      hourlyRate: '€85/hr',
      image: 'https://i.pravatar.cc/150?img=7',
      completedProjects: 12
    },
    {
      id: 8,
      name: 'Thomas Anderson',
      specialty: 'Blockchain Developer',
      rating: 4.7,
      hourlyRate: '€90/hr',
      image: 'https://i.pravatar.cc/150?img=8',
      completedProjects: 78
    },
    {
      id: 9,
      name: 'Maria Garcia',
      specialty: 'Cloud Architect',
      rating: 4.9,
      hourlyRate: '€95/hr',
      image: 'https://i.pravatar.cc/150?img=9',
      completedProjects: 19
    },
    {
      id: 10,
      name: 'James Wilson',
      specialty: 'Security Expert',
      rating: 4.8,
      hourlyRate: '€88/hr',
      image: 'https://i.pravatar.cc/150?img=10',
      completedProjects: 56
    },
    {
      id: 11,
      name: 'Sarah Lee',
      specialty: 'AI/ML Engineer',
      rating: 4.9,
      hourlyRate: '€92/hr',
      image: 'https://i.pravatar.cc/150?img=11',
      completedProjects: 34
    }
  ]

  // Pagination
  const itemsPerPage = 6
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = activeTab === 'projects' ? projectsData.slice(indexOfFirstItem, indexOfLastItem) : freelancersData.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil((activeTab === 'projects' ? projectsData.length : freelancersData.length) / itemsPerPage)

  // Loader state
  useEffect(() => {
    setIsLoading(true)
    setCurrentPage(1)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [activeTab])

  return (
    <section className='w-full pt-0 pb-20 theme-bg relative z-[2]'>
      <div className='absolute inset-0 overflow-hidden'>
        {/* Molecular patterns */}
        <div className='absolute -left-20 top-40 opacity-20'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[45deg]' />
        </div>
        <div className='absolute -right-20 bottom-20 opacity-15'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[-30deg]' />
        </div>
        <div className='absolute left-3/4 top-28 opacity-10'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[35deg]' />
        </div>
        <div className='absolute right-1/3 top-1/3 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[60deg]' />
        </div>
        <div className='absolute left-1/3 bottom-40 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[-15deg]' />
        </div>
      </div>

      {/* Pagrindinis konteineris su mygtukais */}
      <div className='container mx-auto px-4 relative z-10'>
        <div className='max-w-8xl mx-auto'>
          {/* Projektu ir Freelanceriu mygtukai */}
          <div className='flex w-full'>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 border-b-2 transition-all duration-300 ${
                activeTab === 'projects'
                  ? 'border-accent text-accent dark:bg-light/5 bg-primary/5'
                  : 'dark:border-light/10 border-primary/10 dark:text-light/60 text-primary/60 dark:hover:text-light/80 hover:text-primary/80 dark:hover:bg-light/5 hover:bg-primary/5'
              }`}>
              <FaBriefcase className='text-lg' />
              <span className='font-medium'>Projects</span>
            </button>
            <button
              onClick={() => setActiveTab('freelancers')}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 border-b-2 transition-all duration-300 ${
                activeTab === 'freelancers'
                  ? 'border-accent text-accent dark:bg-light/5 bg-primary/5'
                  : 'dark:border-light/10 border-primary/10 dark:text-light/60 text-primary/60 dark:hover:text-light/80 hover:text-primary/80 dark:hover:bg-light/5 hover:bg-primary/5'
              }`}>
              <FaUser className='text-lg' />
              <span className='font-medium'>Freelancers</span>
            </button>
          </div>

          {/* Sarasu sekcija su animacija */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'projects' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'projects' ? 20 : -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className='bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent backdrop-blur-sm rounded-b-lg p-12'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {isLoading
                ? Array(6)
                    .fill(0)
                    .map((_, index) => <CardLoader key={index} />)
                : activeTab === 'projects'
                ? currentItems.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)
                : currentItems.map((freelancer, index) => <FreelancerCard key={freelancer.id} freelancer={freelancer} index={index} />)}
            </div>

            {/* Puslapiu numeracija apacioje */}
            <div className='mt-12 flex justify-center gap-2'>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg transition-all duration-300 ${currentPage === i + 1 ? 'bg-accent text-white' : 'bg-accent/20 text-accent hover:bg-accent/30'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ListingTabs
