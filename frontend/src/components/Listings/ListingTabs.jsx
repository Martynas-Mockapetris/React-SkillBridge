import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaUser, FaBriefcase } from 'react-icons/fa'
import { useContext } from 'react'
import { SearchContext } from '../../context/SearchContext'
import ProjectCard from './ProjectCard'
import FreelancerCard from './FreelancerCard'
import CardLoader from './CardLoader'
import { getAllProjects } from '../../services/projectService'
import { getFreelancers } from '../../services/userService'
import molecularPattern from '../../assets/molecular-pattern.svg'

const ListingTabs = () => {
  const [activeTab, setActiveTab] = useState('projects')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [projects, setProjects] = useState([])
  const [freelancers, setFreelancers] = useState([])
  const [error, setError] = useState(null)
  const { searchTerm } = useContext(SearchContext)

  // Function to filter projects by search term
  const filterProjects = (projectsList) => {
    if (!searchTerm) return projectsList // If no search, return all

    return projectsList.filter(
      (project) =>
        // Search in title, description, and skills
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.skills?.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }

  // Function to filter freelancers by search term
  const filterFreelancers = (freelancersList) => {
    if (!searchTerm) return freelancersList // If no search, return all

    return freelancersList.filter(
      (freelancer) =>
        // Search in name and specialty
        freelancer.name.toLowerCase().includes(searchTerm.toLowerCase()) || freelancer.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      if (activeTab === 'projects') {
        try {
          setIsLoading(true)
          setError(null)
          const data = await getAllProjects()
          setProjects(data)
        } catch (err) {
          console.error('Error fetching projects:', err)
          setError('Failed to load projects. Please try again.')
        } finally {
          setIsLoading(false)
        }
      } else {
        // Fetch freelancers from API
        try {
          setIsLoading(true)
          setError(null)

          const data = await getFreelancers()

          // Map API users into FreelancerCard format
          const mapped = data.map((user) => ({
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            specialty: user.skills || 'Freelancer',
            rating: 'New', // placeholder for now (real rating later)
            hourlyRate: '€—/hr', // placeholder for now (real rate later)
            image: user.profilePicture || `https://i.pravatar.cc/150?u=${user._id}`,
            completedProjects: 0 // placeholder (real count later)
          }))

          setFreelancers(mapped)
        } catch (err) {
          console.error('Error fetching freelancers:', err)
          setError('Failed to load freelancers. Please try again.')
        } finally {
          setIsLoading(false)
        }
      }
      setCurrentPage(1)
    }

    fetchProjects()
  }, [activeTab])

  // Pagination
  const itemsPerPage = 6
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const filteredProjects = filterProjects(projects)
  const filteredFreelancers = filterFreelancers(freelancers)

  const currentItems = activeTab === 'projects' ? filteredProjects.slice(indexOfFirstItem, indexOfLastItem) : filteredFreelancers.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil((activeTab === 'projects' ? filteredProjects.length : filteredFreelancers.length) / itemsPerPage)

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

      {/* Main container */}
      <div className='container mx-auto px-4 relative z-10'>
        <div className='max-w-8xl mx-auto'>
          {/* Projects and Freelancers tabs */}
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

          {/* Content section with animation */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'projects' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'projects' ? 20 : -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className='bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent backdrop-blur-sm rounded-b-lg p-12'>
            {/* Error message */}
            {error && activeTab === 'projects' && (
              <div className='text-center py-8'>
                <p className='text-red-500 mb-4'>{error}</p>
                <button onClick={() => window.location.reload()} className='px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all'>
                  Retry
                </button>
              </div>
            )}

            {/* Empty state for projects */}
            {!isLoading && !error && activeTab === 'projects' && projects.length === 0 && (
              <div className='text-center py-12'>
                <FaBriefcase className='text-6xl theme-text-secondary mx-auto mb-4 opacity-50' />
                <h3 className='text-xl font-semibold theme-text mb-2'>No projects available</h3>
                <p className='theme-text-secondary'>Check back later for new opportunities!</p>
              </div>
            )}

            {/* Grid of cards */}
            {(!error || activeTab === 'freelancers') && (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {isLoading
                  ? Array(6)
                      .fill(0)
                      .map((_, index) => <CardLoader key={index} />)
                  : activeTab === 'projects'
                    ? currentItems.map((project, index) => <ProjectCard key={project._id} project={project} index={index} />)
                    : currentItems.map((freelancer, index) => <FreelancerCard key={freelancer.id} freelancer={freelancer} index={index} />)}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
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
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ListingTabs
