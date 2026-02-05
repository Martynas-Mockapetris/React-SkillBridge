import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { reviewProject } from '../services/projectService'
import { toast } from 'react-toastify'

const ReviewProjectModal = ({ isOpen, onClose, project, onReviewSuccess }) => {
  const [feedback, setFeedback] = useState('')
  const [reviewing, setReviewing] = useState(false)

  if (!isOpen || !project) return null

  const submission = project.submission
  const fileUrl = (path) => `/${path}`

  const handleReview = async (decision) => {
    try {
      setReviewing(true)
      await reviewProject(project._id, { decision, feedback })
      toast.success(`Project ${decision === 'accepted' ? 'accepted' : 'declined'}!`)
      onReviewSuccess?.()
      onClose()
      setFeedback('')
    } catch (error) {
      console.error('Error reviewing project:', error)
      toast.error('Failed to review project. Please try again.')
    } finally {
      setReviewing(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className='bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            {/* Header */}
            <div className='sticky top-0 flex justify-between items-center p-6 border-b dark:border-gray-700 border-gray-200 bg-white dark:bg-gray-800'>
              <h2 className='text-2xl font-bold theme-text'>Review Submission</h2>
              <button onClick={onClose} className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'>
                <FaTimes size={24} />
              </button>
            </div>

            {/* Content */}
            <div className='p-6 space-y-6'>
              {submission ? (
                <>
                  {/* Links */}
                  {submission.links?.length > 0 && (
                    <div className='space-y-2'>
                      <h3 className='text-sm font-semibold theme-text'>📎 Links</h3>
                      <div className='space-y-1 max-h-40 overflow-y-auto'>
                        {submission.links.map((link, idx) => (
                          <motion.a
                            key={idx}
                            href={link}
                            target='_blank'
                            rel='noreferrer'
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className='block p-2 rounded-lg bg-primary/5 dark:bg-light/5 border border-primary/10 dark:border-light/10 text-accent hover:bg-accent/10 transition-colors text-xs break-all'>
                            {link}
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Files */}
                  {submission.files?.length > 0 && (
                    <div className='space-y-2'>
                      <h3 className='text-sm font-semibold theme-text'>📁 Files</h3>
                      <div className='space-y-1 max-h-40 overflow-y-auto'>
                        {submission.files.map((file, idx) => (
                          <motion.a
                            key={idx}
                            href={fileUrl(file.path)}
                            target='_blank'
                            rel='noreferrer'
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className='block p-2 rounded-lg bg-primary/5 dark:bg-light/5 border border-primary/10 dark:border-light/10 text-accent hover:bg-accent/10 transition-colors text-xs break-all'>
                            {file.name}
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Note */}
                  {submission.note && (
                    <div className='space-y-2'>
                      <h3 className='text-sm font-semibold theme-text'>📝 Submission Note</h3>
                      <div className='p-3 rounded-lg bg-primary/5 dark:bg-light/5 border border-primary/10 dark:border-light/10'>
                        <p className='text-sm theme-text-secondary leading-relaxed'>{submission.note}</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className='text-sm theme-text-secondary text-center py-6'>No submission found.</p>
              )}

              {/* Divider */}
              <div className='h-px bg-gray-300 dark:bg-gray-700'></div>

              {/* Feedback Section */}
              <div className='space-y-3'>
                <label className='block text-sm font-semibold theme-text'>Your Feedback</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 theme-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent text-sm resize-none'
                  placeholder='Provide constructive feedback for the freelancer...'
                />
              </div>

              {/* Action Buttons */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                <motion.button
                  onClick={() => handleReview('declined')}
                  disabled={reviewing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex items-center justify-center gap-2 py-3 px-4 bg-red-500/90 hover:bg-red-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm'>
                  <FaTimesCircle size={16} /> Decline
                </motion.button>
                <motion.button
                  onClick={() => handleReview('accepted')}
                  disabled={reviewing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex items-center justify-center gap-2 py-3 px-4 bg-green-500/90 hover:bg-green-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm'>
                  <FaCheckCircle size={16} /> Accept
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ReviewProjectModal
