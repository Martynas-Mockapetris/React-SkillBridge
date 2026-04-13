import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa'
import PageBackground from '../components/shared/PageBackground'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { getPublishedBlogPostBySlug } from '../services/blogService'

const BlogPostDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getPublishedBlogPostBySlug(slug)
        setPost(data)
      } catch (err) {
        console.error('Failed to load blog post:', err)
        if (err.response?.status === 404) {
          setError('Blog post not found.')
        } else {
          setError(err.response?.data?.message || 'Failed to load blog post.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      loadPost()
    }
  }, [slug])

  if (loading) {
    return (
      <section className='w-full theme-bg relative z-[1] pt-[80px]'>
        <div className='container mx-auto px-4 py-12 relative z-10 min-h-[calc(100vh-336px)]'>
          <div className='flex items-center justify-center min-h-[320px]'>
            <LoadingSpinner />
          </div>
        </div>
      </section>
    )
  }

  if (error || !post) {
    return (
      <section className='w-full theme-bg relative z-[1] pt-[80px]'>
        <div className='container mx-auto px-4 py-12 relative z-10 min-h-[calc(100vh-336px)]'>
          <button onClick={() => navigate('/blog')} className='inline-flex items-center gap-2 mb-6 theme-text-secondary hover:text-accent transition-colors'>
            <FaArrowLeft />
            Back to Blog
          </button>

          <div className='rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-5 py-4 text-red-700 dark:text-red-300'>{error || 'Blog post not found.'}</div>
        </div>
      </section>
    )
  }

  const displayAuthor = post?.showAuthor === false ? '' : post?.authorName?.trim() || `${post?.author?.firstName || ''} ${post?.author?.lastName || ''}`.trim()

  return (
    <section className='w-full theme-bg relative z-[1] pt-[80px]'>
      <PageBackground variant='profile' />

      <div className='container mx-auto px-4 py-12 relative z-10 min-h-[calc(100vh-336px)] max-w-4xl'>
        <motion.button
          onClick={() => navigate('/blog')}
          className='inline-flex items-center gap-2 mb-8 theme-text-secondary hover:text-accent transition-colors'
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}>
          <FaArrowLeft />
          Back to Blog
        </motion.button>

        <motion.article className='rounded-2xl border theme-border bg-white/50 dark:bg-black/20 overflow-hidden' initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {post.coverImage ? (
            <div className='h-72 md:h-96 overflow-hidden'>
              <img src={post.coverImage} alt={post.title} className='w-full h-full object-cover' />
            </div>
          ) : (
            <div className='h-72 md:h-96 bg-gradient-to-br from-accent/20 via-primary/10 to-transparent' />
          )}

          <div className='p-6 md:p-10'>
            <div className='flex flex-wrap items-center gap-4 text-sm theme-text-secondary mb-5'>
              <span className='inline-flex items-center gap-2'>
                <FaCalendarAlt className='text-accent' />
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Unpublished'}
              </span>
              {displayAuthor && <span>By {displayAuthor}</span>}
            </div>

            <h1 className='text-4xl md:text-5xl font-bold theme-text leading-tight mb-4'>{post.title}</h1>
            <p className='text-lg theme-text-secondary leading-relaxed mb-6'>{post.excerpt}</p>

            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className='flex flex-wrap gap-2 mb-8'>
                {post.tags.map((tag) => (
                  <span key={tag} className='px-3 py-1 text-sm rounded-full bg-accent/10 text-accent'>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className='theme-text leading-8 whitespace-pre-line'>{post.content}</div>
          </div>
        </motion.article>
      </div>
    </section>
  )
}

export default BlogPostDetail
