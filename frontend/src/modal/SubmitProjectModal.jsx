import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaTimes, FaLink, FaUpload } from 'react-icons/fa'
import { submitProject } from '../services/projectService'

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

  const handleSubmit = async () => {
    if (!links.length && files.length === 0 && !note.trim()) {
      alert('Please provide at least a link, a file, or a note.')
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
      onSubmitSuccess?.()
      onClose()
      setLinks([])
      setFiles([])
      setNote('')
      setLinkInput('')
    } catch (error) {
      console.error('Error submitting project:', error)
      alert('Failed to submit project. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className='bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold theme-text'>Submit Project</h2>
          <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
            <FaTimes />
          </button>
        </div>

        {/* Links */}
        <div className='mb-4'>
          <label className='block text-sm font-medium theme-text mb-1'>Links</label>
          <div className='flex gap-2'>
            <input type='text' value={linkInput} onChange={(e) => setLinkInput(e.target.value)} className='flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700' placeholder='https://github.com/your-repo' />
            <button onClick={addLink} className='px-4 py-2 bg-accent text-white rounded-lg'>
              <FaLink />
            </button>
          </div>
          {links.length > 0 && (
            <ul className='mt-2 space-y-1'>
              {links.map((link, idx) => (
                <li key={idx} className='flex justify-between items-center text-sm'>
                  <span className='truncate'>{link}</span>
                  <button onClick={() => removeLink(idx)} className='text-red-500'>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Files */}
        <div className='mb-4'>
          <label className='block text-sm font-medium theme-text mb-1'>Files</label>
          <input type='file' multiple onChange={handleFileChange} />
        </div>

        {/* Note */}
        <div className='mb-4'>
          <label className='block text-sm font-medium theme-text mb-1'>Note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className='w-full px-3 py-2 border rounded-lg dark:bg-gray-700' placeholder='Short description of the submission...' />
        </div>

        <button onClick={handleSubmit} disabled={submitting} className='w-full py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50'>
          {submitting ? 'Submitting...' : 'Submit Project'}
        </button>
      </motion.div>
    </div>
  )
}

export default SubmitProjectModal
