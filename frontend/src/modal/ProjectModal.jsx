import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'

const ProjectModal = ({ isOpen, onClose }) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div className='fixed inset-0 bg-black/50 z-40 backdrop-blur-sm' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

          {/* Modal */}
          <motion.div className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.stopPropagation()}>
            <motion.div
              className='bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className='flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700'>
                <h2 className='text-2xl font-bold theme-text'>Create New Project</h2>
                <button onClick={onClose} className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors'>
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Modal Body - Form Container */}
              <div className='p-6'>
                <form>
                  {/* Basic form structure - we'll add fields in the next step */}
                  <div className='space-y-6'>
                    <div className='border-b border-gray-200 dark:border-gray-700 pb-6'>
                      <h3 className='text-lg font-medium theme-text mb-4'>Basic Information</h3>
                      <p className='text-sm theme-text-secondary mb-4'>Provide the essential details about your project.</p>

                      {/* Form fields will go here */}
                      <div className='bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center theme-text-secondary'>Form fields will be added here</div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className='mt-6 flex justify-end space-x-3'>
                    <motion.button
                      type='button'
                      onClick={onClose}
                      className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg theme-text hover:bg-gray-50 dark:hover:bg-gray-700'
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}>
                      Cancel
                    </motion.button>
                    <motion.button type='button' className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      Save as Draft
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ProjectModal
