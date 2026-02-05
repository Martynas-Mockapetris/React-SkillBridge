import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaLink, FaUpload, FaTrash } from 'react-icons/fa'
import { submitProject } from '../services/projectService'
import { toast } from 'react-toastify'

const SubmitProjectModal = ({ isOpen, onClose, project, onSubmitSuccess }) => {
  const [linkInput, setLinkInput] = useState('')
  const [links, setLinks] = useState([])
  const [note, setNote] = useState('')
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen || !project) return null

  const addLink = () => {
    if (!linkInput.trim()) return
    setLinks((prev) => [...prev, linkInput.trim()])
    setLinkInput('')
  }

  const removeLink = (index) => {
    setLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)
    setFiles((prev) => [...prev, ...selected])
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!links.length && files.length === 0 && !note.trim()) {
      toast.error('Please provide at least a link, a file, or a note.')
      return
    }

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('links', JSON.stringify(links))
      formData.append('note', note)

      files.forEach((file) => {
        formData.append('submissionFiles', file)
      })

      await submitProject(project._id, formData)
      toast.success('Project submitted successfully!')
      onSubmitSuccess?.()
      onClose()
      setLinks([])
      setFiles([])
      setNote('')
      setLinkInput('')
    } catch (error) {
      console.error('Error submitting project:', error)
      toast.error('Failed to submit project. Please try again.')
    } finally {
      setSubmitting(false)
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
            className='bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto'>
            {/* Header */}
            <div className='sticky top-0 flex justify-between items-center p-6 border-b dark:border-gray-700 border-gray-200 bg-white dark:bg-gray-800'>
              <h2 className='text-2xl font-bold theme-text'>Submit Project</h2>
              <button onClick={onClose} className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'>
                <FaTimes size={24} />
              </button>
            </div>

            {/* Content */}
            <div className='p-6 space-y-6'>
              {/* Links Section */}
              <div className='space-y-3'>
                <label className='block text-sm font-semibold theme-text'>
                  Links <span className='text-gray-400 text-xs font-normal'>(GitHub, Figma, Demo, etc.)</span>
                </label>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addLink()}
                    className='flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 theme-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent text-sm'
                    placeholder='https://github.com/your-repo'
                  />
                  <motion.button
                    onClick={addLink}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all font-medium text-sm flex items-center gap-2'>
                    <FaLink size={14} /> Add
                  </motion.button>
                </div>

                {links.length > 0 && (
                  <div className='space-y-2 max-h-40 overflow-y-auto'>
                    {links.map((link, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className='flex justify-between items-center gap-2 p-2 rounded-lg bg-primary/5 dark:bg-light/5 border border-primary/10 dark:border-light/10'>
                        <a href={link} target='_blank' rel='noreferrer' className='text-accent hover:underline text-xs truncate'>
                          {link}
                        </a>
                        <button onClick={() => removeLink(idx)} className='text-gray-400 hover:text-red-500 transition-colors flex-shrink-0'>
                          <FaTrash size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Files Section */}
              <div className='space-y-3'>
                <label className='block text-sm font-semibold theme-text'>Files (Optional)</label>
                <div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-accent transition-colors cursor-pointer'>
                  <input type='file' id='file-input' multiple onChange={handleFileChange} className='hidden' />
                  <label htmlFor='file-input' className='cursor-pointer flex flex-col items-center gap-2'>
                    <FaUpload className='text-gray-400 text-2xl' />
                    <p className='text-sm font-medium theme-text'>Click to upload files</p>
                    <p className='text-xs theme-text-secondary'>Max 5 files, 10MB each</p>
                  </label>
                </div>

                {files.length > 0 && (
                  <div className='space-y-2 max-h-40 overflow-y-auto'>
                    {files.map((file, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className='flex justify-between items-center gap-2 p-2 rounded-lg bg-primary/5 dark:bg-light/5 border border-primary/10 dark:border-light/10'>
                        <span className='text-xs theme-text truncate'>{file.name}</span>
                        <button onClick={() => removeFile(idx)} className='text-gray-400 hover:text-red-500 transition-colors flex-shrink-0'>
                          <FaTrash size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Note Section */}
              <div className='space-y-3'>
                <label className='block text-sm font-semibold theme-text'>Notes (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 theme-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent text-sm resize-none'
                  placeholder='Tell the client what you submitted and any important details...'
                />
              </div>

              {/* Submit Button */}
              <motion.button
                onClick={handleSubmit}
                disabled={submitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='w-full py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium'>
                {submitting ? 'Submitting...' : 'Submit Project'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default SubmitProjectModal
