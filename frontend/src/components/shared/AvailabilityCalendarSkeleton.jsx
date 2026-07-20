import { motion } from 'framer-motion'

const AvailabilityCalendarSkeleton = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='p-6 theme-card rounded-lg border dark:border-light/10 border-primary/10'>
      {/* Header Skeleton */}
      <div className='flex items-center justify-between mb-6'>
        <div className='h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
        <div className='flex gap-2'>
          <div className='w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
          <div className='w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
        </div>
      </div>

      {/* Legend Skeleton */}
      <div className='grid grid-cols-4 gap-2 mb-6'>
        {[...Array(4)].map((_, i) => (
          <div key={i} className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse'></div>
            <div className='h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
          </div>
        ))}
      </div>

      {/* Calendar Grid Skeleton */}
      <div className='grid grid-cols-7 gap-2 mb-4'>
        {[...Array(7)].map((_, i) => (
          <div key={i} className='text-center h-6 bg-gray-100 dark:bg-gray-800 rounded animate-pulse'></div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-2'>
        {[...Array(35)].map((_, i) => (
          <div key={i} className='aspect-square bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
        ))}
      </div>

      {/* Stats Skeleton */}
      <div className='mt-6 pt-6 border-t dark:border-light/10 border-primary/10 grid grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <div key={i} className='p-3 rounded-lg bg-gray-100 dark:bg-gray-800'>
            <div className='h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2'></div>
            <div className='h-6 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default AvailabilityCalendarSkeleton
