import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'
import { reviewProject } from '../services/projectService'

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
      onReviewSuccess?.()
      onClose()
      setFeedback('')
    } catch (error) {
      console.error('Error reviewing project:', error)
      alert('Failed to review project. Please try again.')
    } finally {
      setReviewing(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className='bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold theme-text'>Review Submission</h2>
          <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
            <FaTimes />
          </button>
        </div>

        {submission ? (
          <>
            <div className='mb-4'>
              <h3 className='font-medium theme-text'>Links</h3>
              {submission.links?.length ? (
                <ul className='list-disc pl-5 text-sm'>
                  {submission.links.map((link, idx) => (
                    <li key={idx}>
                      <a href={link} target='_blank' rel='noreferrer' className='text-accent underline'>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-sm theme-text-secondary'>No links submitted</p>
              )}
            </div>

            <div className='mb-4'>
              <h3 className='font-medium theme-text'>Files</h3>
              {submission.files?.length ? (
                <ul className='list-disc pl-5 text-sm'>
                  {submission.files.map((file, idx) => (
                    <li key={idx}>
                      <a href={fileUrl(file.path)} target='_blank' rel='noreferrer' className='text-accent underline'>
                        {file.name}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-sm theme-text-secondary'>No files submitted</p>
              )}
            </div>

            <div className='mb-4'>
              <h3 className='font-medium theme-text'>Note</h3>
              <p className='text-sm theme-text-secondary'>{submission.note || 'No note provided'}</p>
            </div>
          </>
        ) : (
          <p className='text-sm theme-text-secondary'>No submission found.</p>
        )}

        <div className='mb-4'>
          <label className='block text-sm font-medium theme-text mb-1'>Feedback (optional)</label>
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} className='w-full px-3 py-2 border rounded-lg dark:bg-gray-700' placeholder='Feedback for the freelancer...' />
        </div>

        <div className='flex gap-3'>
          <button onClick={() => handleReview('declined')} disabled={reviewing} className='flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50'>
            Decline
          </button>
          <button onClick={() => handleReview('accepted')} disabled={reviewing} className='flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50'>
            Accept
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ReviewProjectModal
