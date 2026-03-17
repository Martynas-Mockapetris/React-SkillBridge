import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const PaginationControls = ({ currentPage, totalPages, onPrev, onNext, label }) => {
  if (!totalPages || totalPages < 1) return null

  return (
    <div className='mt-6 flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg'>
      <div className='text-sm text-gray-700 dark:text-gray-300'>{label || `Page ${currentPage} of ${totalPages}`}</div>

      <div className='flex items-center space-x-2'>
        <button onClick={onPrev} disabled={currentPage === 1} className='px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50'>
          <FaChevronLeft className='w-4 h-4' />
        </button>

        <span className='px-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600'>{currentPage}</span>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className='px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50'>
          <FaChevronRight className='w-4 h-4' />
        </button>
      </div>
    </div>
  )
}

export default PaginationControls
