import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaUser, FaBriefcase } from 'react-icons/fa'
import molecularPattern from '../../assets/molecular-pattern.svg'
import ProjectCard from './ProjectCard'

const ListingTabs = () => {
  const [activeTab, setActiveTab] = useState('projects')

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
        name: 'Emma Thompson',
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
        name: 'Lisa Anderson',
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
        name: 'Thomas Wright',
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
        name: 'Nina Patel',
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

  return (
    <section className='w-full py-32 theme-bg relative z-[2] mt-[-100px]'>
      <div className='absolute inset-0 overflow-hidden'>
        {/* Molecular patterns */}
        <div className='absolute -left-20 top-40 opacity-20'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[45deg]' />
        </div>
        <div className='absolute -right-20 bottom-20 opacity-15'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[-30deg]' />
        </div>
        <div className='absolute left-1/4 top-10 opacity-10'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[15deg]' />
        </div>
        <div className='absolute right-1/3 top-1/3 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[60deg]' />
        </div>
        <div className='absolute left-1/3 bottom-40 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[-15deg]' />
        </div>
      </div>

      <div className='container mx-auto px-4 relative z-10'>
        <div className='max-w-8xl mx-auto'>
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

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'projects' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'projects' ? 20 : -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className='bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent backdrop-blur-sm rounded-b-lg p-12'>
            {activeTab === 'projects' && (
              <>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {projectsData.map((project, index) => (
                    <ProjectCard key={project.id} project={project} index={index} />
                  ))}
                </div>
                <div className='mt-12 text-center'>
                  <button className='text-accent hover:text-accent/80 transition-colors duration-300'>Load More Projects...</button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ListingTabs
