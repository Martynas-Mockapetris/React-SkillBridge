import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaCheck, FaPaperPlane } from 'react-icons/fa'
import { createProject, saveProjectDraft } from '../services/projectService'
import { toast } from 'react-toastify'

const HireFreelancerModal = ({ isOpen, onClose, freelancer, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills: '',
    budget: '',
    deadline: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = ['Web Development', 'Mobile Development', 'UI/UX Design', 'Data Science', 'Machine Learning', 'DevOps', 'Blockchain', 'Content Writing', 'Digital Marketing', 'Other']

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!formData.category) {
      setError('Category is required')
      return false
    }
    if (!formData.skills.trim()) {
      setError('At least one skill is required')
      return false
    }
    if (!formData.budget || Number(formData.budget) <= 0) {
      setError('Budget must be greater than 0')
      return false
    }
    if (!formData.deadline) {
      setError('Deadline is required')
      return false
    }
    return true
  }

  const buildPayload = () => ({
    title: formData.title.trim(),
    description: formData.description.trim(),
    category: formData.category,
    skills: formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    budget: Number(formData.budget),
    deadline: formData.deadline,
    assigneeId: freelancer._id
  })

  const handleSaveDraft = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      setError('')
      await saveProjectDraft(buildPayload())
      toast.success('Draft saved. Freelancer not notified.')
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save draft')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      setError('')
      await createProject({ ...buildPayload(), status: 'assigned' })
      toast.success('Project assigned to freelancer!')
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40' />

          {/* Modal */}
          <motion.div className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.stopPropagation()}>
            <motion.div
              className='bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className='flex items-center justify-between p-6 border-b dark:border-light/10 border-primary/10 sticky top-0 bg-inherit rounded-t-lg'>
                <h2 className='text-2xl font-bold theme-text'>
                  Hire {freelancer.firstName} {freelancer.lastName}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  disabled={loading}
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50'>
                  <FaTimes size={24} />
                </motion.button>
              </div>

              {/* Body */}
              <form className='p-6 space-y-4'>
                {error && <div className='p-3 bg-red-100 text-red-700 rounded'>{error}</div>}

                <div>
                  <label className='block text-sm font-medium theme-text mb-1'>Project Title</label>
                  <input
                    type='text'
                    name='title'
                    value={formData.title}
                    onChange={handleInputChange}
                    className='w-full p-3 rounded border dark:border-light/10 border-primary/10 theme-bg theme-text'
                    placeholder='Enter project title'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium theme-text mb-1'>Description</label>
                  <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    rows='4'
                    className='w-full p-3 rounded border dark:border-light/10 border-primary/10 theme-bg theme-text'
                    placeholder='Describe your project'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium theme-text mb-1'>Category</label>
                  <select name='category' value={formData.category} onChange={handleInputChange} className='w-full p-3 rounded border dark:border-light/10 border-primary/10 theme-bg theme-text'>
                    <option value=''>Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium theme-text mb-1'>Skills (comma separated)</label>
                  <input
                    type='text'
                    name='skills'
                    value={formData.skills}
                    onChange={handleInputChange}
                    className='w-full p-3 rounded border dark:border-light/10 border-primary/10 theme-bg theme-text'
                    placeholder='React, Node.js, MongoDB'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium theme-text mb-1'>Budget (EUR)</label>
                  <input
                    type='number'
                    name='budget'
                    value={formData.budget}
                    onChange={handleInputChange}
                    className='w-full p-3 rounded border dark:border-light/10 border-primary/10 theme-bg theme-text'
                    placeholder='2000'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium theme-text mb-1'>Deadline</label>
                  <input type='date' name='deadline' value={formData.deadline} onChange={handleInputChange} className='w-full p-3 rounded border dark:border-light/10 border-primary/10 theme-bg theme-text' />
                </div>
              </form>

              {/* Footer */}
              <div className='flex justify-end gap-3 p-6 border-t dark:border-light/10 border-primary/10'>
                <motion.button onClick={handleSaveDraft} disabled={loading} className='px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-all disabled:opacity-50'>
                  Save as Draft
                </motion.button>
                <motion.button onClick={handleAssign} disabled={loading} className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all disabled:opacity-50'>
                  Assign & Notify
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default HireFreelancerModal
