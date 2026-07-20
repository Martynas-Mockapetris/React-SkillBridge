import { motion } from 'framer-motion'
import { FaCalendarAlt, FaDollarSign, FaTags, FaUser, FaUserCheck } from 'react-icons/fa'
import { formatProjectPriorityLabel, formatProjectStatusLabel, getProjectPriorityBadgeClass, getProjectStatusBadgeClass } from '../../utils/projectStatusUI'

const ProjectHeader = ({ project }) => {
  const currentOffer = project.rateNegotiation?.currentOffer
  const isNegotiating = project.rateNegotiation?.status === 'proposed' && currentOffer
  const budgetLabel = isNegotiating ? `€${currentOffer.amount}${currentOffer.type === 'hourly' ? '/hr' : ''}` : project.budget ? `€${project.budget}` : 'To be agreed'
  const deadlineLabel = project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Flexible'
  const clientName = project.user ? `${project.user.firstName} ${project.user.lastName}` : 'Client not available'
  const assigneeName = project.assignee ? `${project.assignee.firstName} ${project.assignee.lastName}` : 'Open project'

  return (
    <motion.div
      className='mb-6 overflow-hidden rounded-2xl border dark:border-light/10 border-primary/10 bg-gradient-to-br dark:from-light/5 dark:via-light/[0.03] dark:to-accent/10 from-white/70 via-white/50 to-accent/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)]'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}>
      <div className='border-b dark:border-light/10 border-primary/10 px-6 py-6 md:px-8'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='space-y-4'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent'>
                <FaTags className='text-[10px]' />
                {project.category}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getProjectStatusBadgeClass(project.status || 'active')}`}>
                {formatProjectStatusLabel(project.status || 'active')}
              </span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getProjectPriorityBadgeClass(project.priority)}`}>{formatProjectPriorityLabel(project.priority)} Priority</span>
            </div>

            <div>
              <h1 className='text-3xl md:text-4xl font-bold theme-text'>{project.title}</h1>
              <p className='mt-2 max-w-3xl theme-text-secondary leading-relaxed'>{project.description}</p>
            </div>
          </div>

          {isNegotiating && (
            <div className='rounded-2xl border border-orange-300/40 bg-orange-100/80 px-4 py-3 dark:border-orange-700/40 dark:bg-orange-900/20'>
              <p className='text-xs font-semibold uppercase tracking-[0.14em] text-orange-700 dark:text-orange-300'>Current Offer</p>
              <p className='mt-1 text-lg font-bold text-orange-900 dark:text-orange-100'>{budgetLabel}</p>
            </div>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 gap-px bg-primary/10 dark:bg-light/10 md:grid-cols-2 xl:grid-cols-4'>
        <div className='bg-white/70 px-6 py-5 dark:bg-light/[0.03]'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent'>
              <FaDollarSign />
            </div>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Budget</p>
              <p className='mt-1 text-base font-semibold theme-text'>{budgetLabel}</p>
            </div>
          </div>
        </div>

        <div className='bg-white/70 px-6 py-5 dark:bg-light/[0.03]'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent'>
              <FaCalendarAlt />
            </div>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Deadline</p>
              <p className='mt-1 text-base font-semibold theme-text'>{deadlineLabel}</p>
            </div>
          </div>
        </div>

        <div className='bg-white/70 px-6 py-5 dark:bg-light/[0.03]'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent'>
              <FaUser />
            </div>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Client</p>
              <p className='mt-1 text-base font-semibold theme-text'>{clientName}</p>
            </div>
          </div>
        </div>

        <div className='bg-white/70 px-6 py-5 dark:bg-light/[0.03]'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent'>
              <FaUserCheck />
            </div>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Assignment</p>
              <p className='mt-1 text-base font-semibold theme-text'>{assigneeName}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProjectHeader
