import { useEffect, useState } from 'react'
import { FaTrash, FaToggleOn, FaToggleOff, FaSyncAlt, FaNewspaper, FaPlus, FaPen } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { createBlogPost, deleteBlogPost, getAdminBlogPosts, toggleBlogPostPublish, updateBlogPost } from '../../services/blogService'
import AdminBlogPostModal from '../../modal/AdminBlogPostModal'

const AdminBlogPostsList = () => {
  const { currentUser } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState('create')
  const [selectedPost, setSelectedPost] = useState(null)
  const [isEditorSubmitting, setIsEditorSubmitting] = useState(false)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getAdminBlogPosts()
      setPosts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load blog posts:', err)
      setError(err.response?.data?.message || 'Failed to load blog posts')
      toast.error('Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleTogglePublish = async (post) => {
    const nextAction = post.isPublished ? 'unpublish' : 'publish'
    const confirmed = window.confirm(`Are you sure you want to ${nextAction} "${post.title}"?`)
    if (!confirmed) return

    try {
      setActionLoadingId(post._id)
      await toggleBlogPostPublish(post._id)
      toast.success(`Blog post ${nextAction}ed successfully`)
      await fetchPosts()
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${nextAction} blog post`)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDelete = async (post) => {
    const confirmed = window.confirm(`Delete blog post "${post.title}"?\n\nThis cannot be undone.`)
    if (!confirmed) return

    try {
      setActionLoadingId(post._id)
      await deleteBlogPost(post._id)
      toast.success('Blog post deleted successfully')
      await fetchPosts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete blog post')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleOpenCreate = () => {
    setEditorMode('create')
    setSelectedPost(null)
    setIsEditorOpen(true)
  }

  const handleOpenEdit = (post) => {
    setEditorMode('edit')
    setSelectedPost(post)
    setIsEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setSelectedPost(null)
    setEditorMode('create')
  }

  const handleEditorSubmit = async (payload, submitMode) => {
    try {
      setIsEditorSubmitting(true)

      if (editorMode === 'edit' && selectedPost?._id) {
        await updateBlogPost(selectedPost._id, payload)
        toast.success(`Blog post ${submitMode === 'publish' ? 'updated and published' : 'updated'} successfully`)
      } else {
        await createBlogPost(payload)
        toast.success(`Blog post ${submitMode === 'publish' ? 'created and published' : 'saved as draft'} successfully`)
      }

      handleCloseEditor()
      await fetchPosts()
    } catch (err) {
      console.error('Failed to save blog post:', err)
      toast.error(err.response?.data?.message || 'Failed to save blog post')
    } finally {
      setIsEditorSubmitting(false)
    }
  }

  const formatDate = (value) => {
    if (!value) return 'N/A'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const publishedCount = posts.filter((post) => post.isPublished).length
  const draftCount = posts.length - publishedCount

  const getDisplayAuthor = (post) => {
    if (post?.showAuthor === false) return 'Hidden'

    if (post?.authorName?.trim()) return post.authorName.trim()

    if (post?.author) {
      const fullName = `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim()
      if (fullName) return fullName
    }

    return 'Unknown'
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Blog Management</h2>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Manage published posts and drafts for the public blog</p>
        </div>

        <div className='flex items-center gap-3'>
          <button onClick={handleOpenCreate} className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all text-sm font-medium inline-flex items-center gap-2'>
            <FaPlus />
            New Post
          </button>

          <button
            onClick={fetchPosts}
            className='px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm font-medium inline-flex items-center gap-2'>
            <FaSyncAlt />
            Refresh
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Total Posts</p>
          <p className='text-2xl font-bold text-gray-900 dark:text-white'>{posts.length}</p>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Published</p>
          <p className='text-2xl font-bold text-green-600'>{publishedCount}</p>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Drafts</p>
          <p className='text-2xl font-bold text-amber-600'>{draftCount}</p>
        </div>
      </div>

      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden'>
        {loading && (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-accent'></div>
          </div>
        )}

        {!loading && error && (
          <div className='p-8 text-center'>
            <p className='text-red-600 dark:text-red-400'>{error}</p>
            <button onClick={fetchPosts} className='mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90'>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className='p-10 text-center text-gray-500 dark:text-gray-400'>
            <FaNewspaper className='mx-auto mb-4 text-4xl opacity-40' />
            No blog posts found
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 dark:bg-gray-700'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Post</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Slug</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Author</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Status</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Published</th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>

              <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                {posts.map((post) => {
                  const isBusy = actionLoadingId === post._id

                  return (
                    <tr key={post._id} className='hover:bg-gray-50 dark:hover:bg-gray-700'>
                      <td className='px-6 py-4'>
                        <div className='text-sm font-medium text-gray-900 dark:text-white'>{post.title}</div>
                        <div className='text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2'>{post.excerpt}</div>
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{post.slug}</td>

                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>{getDisplayAuthor(post)}</td>

                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            post.isPublished ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                          }`}>
                          {post.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{formatDate(post.publishedAt)}</td>

                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <div className='flex items-center justify-end gap-2'>
                          <button onClick={() => handleOpenEdit(post)} disabled={isBusy} className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50' title='Edit'>
                            <FaPen />
                          </button>

                          <button
                            onClick={() => handleTogglePublish(post)}
                            disabled={isBusy}
                            className={`${post.isPublished ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'} disabled:opacity-50`}
                            title={post.isPublished ? 'Unpublish' : 'Publish'}>
                            {post.isPublished ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                          </button>

                          <button onClick={() => handleDelete(post)} disabled={isBusy} className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50' title='Delete'>
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminBlogPostModal isOpen={isEditorOpen} mode={editorMode} post={selectedPost} currentUser={currentUser} isSubmitting={isEditorSubmitting} onClose={handleCloseEditor} onSubmit={handleEditorSubmit} />
    </div>
  )
}

export default AdminBlogPostsList
