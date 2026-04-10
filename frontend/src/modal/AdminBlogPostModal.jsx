import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const inputClasses = 'w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent transition'
const labelClasses = 'block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1'

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  tags: '',
  isPublished: false
}

const AdminBlogPostModal = ({ isOpen, mode = 'create', post, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    if (!isOpen) {
      setFormData(emptyForm)
      return
    }

    if (mode === 'edit' && post) {
      setFormData({
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        coverImage: post.coverImage || '',
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
        isPublished: Boolean(post.isPublished)
      })
      return
    }

    setFormData(emptyForm)
  }, [isOpen, mode, post])

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (submitMode) => {
    const payload = {
      ...formData,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      isPublished: submitMode === 'publish'
    }

    onSubmit?.(payload, submitMode)
  }

  return (
    <AnimatePresence>
      <motion.div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          className='w-full max-w-4xl rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden'
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}>
          <div className='px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between'>
            <div>
              <p className='text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500'>Admin Blog Editor</p>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>{mode === 'edit' ? 'Edit Blog Post' : 'Create Blog Post'}</h3>
            </div>
            <button onClick={onClose} className='text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 text-2xl leading-none'>
              &times;
            </button>
          </div>

          <div className='px-6 py-6 space-y-6 bg-white dark:bg-transparent'>
            <div className='grid lg:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div>
                  <label className={labelClasses}>Title</label>
                  <input value={formData.title} onChange={(e) => handleChange('title', e.target.value)} className={inputClasses} placeholder='Enter post title' />
                </div>

                <div>
                  <label className={labelClasses}>Excerpt</label>
                  <textarea rows='4' value={formData.excerpt} onChange={(e) => handleChange('excerpt', e.target.value)} className={`${inputClasses} resize-none`} placeholder='Short summary shown in blog cards' />
                </div>

                <div>
                  <label className={labelClasses}>Cover Image URL</label>
                  <input value={formData.coverImage} onChange={(e) => handleChange('coverImage', e.target.value)} className={inputClasses} placeholder='https://example.com/image.jpg' />
                </div>

                <div>
                  <label className={labelClasses}>Tags</label>
                  <input value={formData.tags} onChange={(e) => handleChange('tags', e.target.value)} className={inputClasses} placeholder='react, freelance, platform' />
                  <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>Separate tags with commas.</p>
                </div>

                <label className='flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 pt-2'>
                  <input type='checkbox' checked={formData.isPublished} onChange={(e) => handleChange('isPublished', e.target.checked)} className='h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent' />
                  Mark as published in preview state
                </label>
              </div>

              <div>
                <label className={labelClasses}>Content</label>
                <textarea rows='16' value={formData.content} onChange={(e) => handleChange('content', e.target.value)} className={`${inputClasses} resize-none`} placeholder='Write the full blog post content here...' />
              </div>
            </div>

            <div className='flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-5'>
              <button type='button' onClick={onClose} className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition'>
                Cancel
              </button>
              <button type='button' onClick={() => handleSubmit('draft')} className='px-5 py-2 rounded-lg bg-gray-900 text-white dark:bg-gray-700 font-semibold hover:opacity-90'>
                Save Draft
              </button>
              <button type='button' onClick={() => handleSubmit('publish')} className='px-5 py-2 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90'>
                Publish
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AdminBlogPostModal
