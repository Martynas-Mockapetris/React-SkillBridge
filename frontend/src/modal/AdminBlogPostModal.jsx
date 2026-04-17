import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const inputClasses = 'w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent transition'
const labelClasses = 'block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1'

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  tags: '',
  author: '',
  includeAuthor: false,
  isPublished: false
}

const getLoggedInAuthorValue = (currentUser) => {
  const fullName = `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim()

  if (fullName) return fullName
  return currentUser?.email || ''
}

const getExistingAuthorValue = (post) => {
  if (post?.showAuthor === false) return ''

  if (post?.authorName) return post.authorName

  if (typeof post?.author === 'string') {
    return post.author
  }

  const fullName = `${post?.author?.firstName || ''} ${post?.author?.lastName || ''}`.trim()

  if (fullName) return fullName
  return post?.author?.email || ''
}

const AdminBlogPostModal = ({ isOpen, mode = 'create', post, currentUser, isSubmitting = false, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(emptyForm)

  const loggedInAuthorValue = useMemo(() => getLoggedInAuthorValue(currentUser), [currentUser])

  useEffect(() => {
    if (!isOpen) {
      setFormData(emptyForm)
      return
    }

    if (mode === 'edit' && post) {
      const existingAuthor = getExistingAuthorValue(post)

      setFormData({
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        coverImage: post.coverImage || '',
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
        author: existingAuthor,
        includeAuthor: Boolean(existingAuthor),
        isPublished: Boolean(post.isPublished)
      })
      return
    }

    setFormData(emptyForm)
  }, [isOpen, mode, post])

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleIncludeAuthorChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      includeAuthor: checked,
      author: checked ? loggedInAuthorValue : ''
    }))
  }

  const handleSubmit = (submitMode) => {
    const payload = {
      ...formData,
      author: formData.includeAuthor ? formData.author.trim() : '',
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      isPublished: submitMode === 'publish'
    }

    onSubmit?.(payload, submitMode)
  }

  if (!isOpen) return null

  const previewTags = formData.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  const previewTitle = formData.title.trim() || 'Untitled blog post'
  const previewExcerpt = formData.excerpt.trim() || 'Your short blog summary will appear here.'
  const previewAuthor = formData.includeAuthor ? formData.author.trim() : ''
  const previewContent = formData.content.trim() || 'Start writing the blog content to see a live preview.'
  const previewStatus = formData.isPublished ? 'Published preview' : 'Draft preview'

  return (
    <AnimatePresence>
      <motion.div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          className='w-full max-w-5xl rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col'
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

          <div className='px-6 py-6 overflow-y-auto bg-white dark:bg-transparent space-y-6'>
            <div className='grid md:grid-cols-2 gap-6'>
              <div>
                <label className={labelClasses}>Title</label>
                <input value={formData.title} onChange={(e) => handleChange('title', e.target.value)} className={inputClasses} placeholder='Enter post title' />
              </div>

              <div>
                <label className={labelClasses}>Cover Image URL</label>
                <input value={formData.coverImage} onChange={(e) => handleChange('coverImage', e.target.value)} className={inputClasses} placeholder='https://example.com/image.jpg' />
              </div>
            </div>

            <div className='rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40 p-4 space-y-3'>
              <label className='flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300'>
                <input type='checkbox' checked={formData.includeAuthor} onChange={(e) => handleIncludeAuthorChange(e.target.checked)} className='h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent' />
                Include author
              </label>

              {formData.includeAuthor && (
                <div>
                  <label className={labelClasses}>Author</label>
                  <input value={formData.author} onChange={(e) => handleChange('author', e.target.value)} className={inputClasses} placeholder={loggedInAuthorValue || 'Enter author name'} />
                  <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>Checking the box inserts the logged-in user details. You can delete that text and type a custom author manually.</p>
                </div>
              )}
            </div>

            <div>
              <label className={labelClasses}>Excerpt</label>
              <textarea rows='4' value={formData.excerpt} onChange={(e) => handleChange('excerpt', e.target.value)} className={`${inputClasses} resize-none`} placeholder='Short summary shown in blog cards' />
            </div>

            <div>
              <label className={labelClasses}>Tags</label>
              <input value={formData.tags} onChange={(e) => handleChange('tags', e.target.value)} className={inputClasses} placeholder='react, freelance, platform' />
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-2'>Separate tags with commas.</p>
            </div>

            <div>
              <label className={labelClasses}>Content</label>
              <textarea rows='12' value={formData.content} onChange={(e) => handleChange('content', e.target.value)} className={`${inputClasses} resize-none`} placeholder='Write the full blog post content here...' />
            </div>

            <label className='flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300'>
              <input type='checkbox' checked={formData.isPublished} onChange={(e) => handleChange('isPublished', e.target.checked)} className='h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent' />
              Mark as published in preview state
            </label>

            <div className='border-t border-gray-200 dark:border-gray-800 pt-6'>
              <h4 className='text-xl font-semibold text-gray-900 dark:text-white mb-4'>Blog Post Preview</h4>

              <div className='rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900/40'>
                <div className='px-6 py-5 border-b border-gray-100 dark:border-gray-800'>
                  <div className='flex flex-wrap items-center gap-2 mb-4'>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${formData.isPublished ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'}`}>
                      {previewStatus}
                    </span>
                    {previewAuthor && <span className='inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'>By {previewAuthor}</span>}
                  </div>

                  <h5 className='text-3xl font-semibold text-gray-900 dark:text-white leading-tight'>{previewTitle}</h5>
                  <p className='text-base text-gray-500 dark:text-gray-400 mt-3 max-w-3xl'>{previewExcerpt}</p>
                </div>

                <div className='p-6 space-y-5'>
                  <div className='rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900'>
                    {formData.coverImage.trim() ? (
                      <img src={formData.coverImage} alt={previewTitle} className='w-full h-72 object-cover' />
                    ) : (
                      <div className='h-72 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500'>Cover image preview appears here</div>
                    )}
                  </div>

                  {previewTags.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {previewTags.map((tag) => (
                        <span key={tag} className='inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className='rounded-xl bg-gray-50 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 p-5'>
                    <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3'>Content Preview</p>
                    <div className='text-base leading-8 text-gray-700 dark:text-gray-300 whitespace-pre-line min-h-[180px]'>{previewContent}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 px-6 py-5 bg-white dark:bg-gray-950'>
            <button
              type='button'
              onClick={onClose}
              disabled={isSubmitting}
              className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed'>
              Cancel
            </button>
            <button
              type='button'
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting}
              className='px-5 py-2 rounded-lg bg-gray-900 text-white dark:bg-gray-700 font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed'>
              {isSubmitting ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type='button'
              onClick={() => handleSubmit('publish')}
              disabled={isSubmitting}
              className='px-5 py-2 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed'>
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AdminBlogPostModal
