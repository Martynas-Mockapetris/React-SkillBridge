import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowRight, FaCalendarAlt } from 'react-icons/fa'
import PageBackground from '../components/shared/PageBackground'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { getPublishedBlogPosts } from '../services/blogService'

const EXCERPT_PREVIEW_LIMIT = 200

const truncateText = (value = '', limit = EXCERPT_PREVIEW_LIMIT) => {
  const normalized = value.trim()

  if (normalized.length <= limit) return normalized
  return `${normalized.slice(0, limit).trimEnd()}...`
}

const Blog = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getPublishedBlogPosts()
        setPosts(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load blog posts:', err)
        setError(err.response?.data?.message || 'Failed to load blog posts.')
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  return (
    <section className='w-full theme-bg relative z-[1] pt-[80px]'>
      <PageBackground variant='minimal' />

      <div className='container mx-auto px-4 py-12 relative z-10 min-h-[calc(100vh-336px)]'>
        <motion.div className='max-w-3xl mb-10' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className='text-sm uppercase tracking-[0.2em] text-accent mb-3'>SkillBridge Blog</p>
          <h1 className='text-4xl md:text-5xl font-bold theme-text leading-tight'>Ideas, platform updates, and practical freelance guidance</h1>
          <p className='theme-text-secondary mt-4 text-lg'>Read platform news, workflow tips, and articles for clients and freelancers building better projects together.</p>
        </motion.div>

        {loading && (
          <div className='flex items-center justify-center min-h-[320px]'>
            <LoadingSpinner />
          </div>
        )}

        {!loading && error && <div className='rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-5 py-4 text-red-700 dark:text-red-300'>{error}</div>}

        {!loading && !error && posts.length === 0 && (
          <div className='rounded-xl border theme-border bg-white/40 dark:bg-black/20 px-6 py-10 text-center'>
            <h2 className='text-2xl font-semibold theme-text mb-2'>No blog posts yet</h2>
            <p className='theme-text-secondary'>Published articles will appear here once the blog starts rolling.</p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <div className='columns-1 lg:columns-2 gap-6 [column-fill:_balance]'>
            {posts.map((post, index) => (
              <div key={post._id} className='inline-block w-full mb-6 break-inside-avoid'>
                <motion.article
                  className='rounded-2xl border theme-border bg-white/50 dark:bg-black/20 overflow-hidden hover:shadow-xl transition-all'
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}>
                  {post.coverImage ? (
                    <div className='h-56 overflow-hidden'>
                      <img src={post.coverImage} alt={post.title} className='w-full h-full object-cover' />
                    </div>
                  ) : (
                    <div className='h-56 bg-gradient-to-br from-accent/20 via-primary/10 to-transparent' />
                  )}

                  <div className='p-6'>
                    <div className='flex items-center gap-2 text-sm theme-text-secondary mb-3'>
                      <FaCalendarAlt className='text-accent' />
                      <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft date unavailable'}</span>
                    </div>

                    <h2 className='text-2xl font-semibold theme-text mb-3'>{post.title}</h2>
                    <p className='theme-text-secondary leading-relaxed mb-4'>{truncateText(post.excerpt)}</p>

                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className='flex flex-wrap gap-2 mb-5'>
                        {post.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className='px-3 py-1 text-sm rounded-full bg-accent/10 text-accent'>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link to={`/blog/${post.slug}`} className='inline-flex items-center gap-2 text-accent font-semibold hover:opacity-80 transition-opacity'>
                      Read article
                      <FaArrowRight />
                    </Link>
                  </div>
                </motion.article>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Blog
