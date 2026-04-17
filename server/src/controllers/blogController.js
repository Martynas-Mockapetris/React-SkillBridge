import BlogPost from '../models/BlogPost.js'
import { buildFieldChanges, logAdminAction } from '../utils/adminActionLogger.js'

const createSlug = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const existing = await BlogPost.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {})
    })

    if (!existing) return slug

    slug = `${baseSlug}-${counter}`
    counter += 1
  }
}

const AUDITABLE_BLOG_FIELDS = ['title', 'slug', 'excerpt', 'content', 'coverImage', 'tags', 'authorName', 'showAuthor', 'isPublished', 'publishedAt']

// @desc    Get all published blog posts
// @route   GET /api/blog
// @access  Public
export const getPublishedBlogPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find({ isPublished: true }).populate('author', 'firstName lastName profilePicture').sort({ publishedAt: -1, createdAt: -1 })

    res.json(posts)
  } catch (error) {
    console.error('Error fetching published blog posts:', error)
    res.status(500).json({ message: 'Failed to fetch blog posts', error: error.message })
  }
}

// @desc    Get published blog post by slug
// @route   GET /api/blog/:slug
// @access  Public
export const getPublishedBlogPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const post = await BlogPost.findOne({ slug, isPublished: true }).populate('author', 'firstName lastName profilePicture')

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' })
    }

    res.json(post)
  } catch (error) {
    console.error('Error fetching blog post by slug:', error)
    res.status(500).json({ message: 'Failed to fetch blog post', error: error.message })
  }
}

// @desc    Get all blog posts for admin
// @route   GET /api/blog/admin/all
// @access  Admin
export const getAllBlogPostsAdmin = async (req, res) => {
  try {
    const posts = await BlogPost.find().populate('author', 'firstName lastName profilePicture').sort({ updatedAt: -1 })

    res.json(posts)
  } catch (error) {
    console.error('Error fetching admin blog posts:', error)
    res.status(500).json({ message: 'Failed to fetch blog posts', error: error.message })
  }
}

// @desc    Create blog post
// @route   POST /api/blog
// @access  Admin
export const createBlogPost = async (req, res) => {
  try {
    const { title, excerpt, content, coverImage = '', tags = [], isPublished = false, author = '', includeAuthor = true } = req.body

    if (!title || !excerpt || !content) {
      return res.status(400).json({ message: 'Title, excerpt, and content are required' })
    }

    const baseSlug = createSlug(title)
    if (!baseSlug) {
      return res.status(400).json({ message: 'Invalid blog title' })
    }

    const slug = await ensureUniqueSlug(baseSlug)

    const defaultAuthorName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email || ''
    const showAuthor = Boolean(includeAuthor)
    const authorName = showAuthor ? (typeof author === 'string' && author.trim() ? author.trim() : defaultAuthorName) : ''

    const post = await BlogPost.create({
      title,
      slug,
      excerpt,
      content,
      coverImage,
      tags: Array.isArray(tags) ? tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
      authorName,
      showAuthor,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      author: req.user._id
    })

    await post.populate('author', 'firstName lastName profilePicture')

    await logAdminAction({
      req,
      action: 'blog.created',
      targetType: 'blog_post',
      targetId: post._id,
      targetLabel: post.title || 'Untitled blog post',
      summary: `Created blog post ${post.title || 'Untitled blog post'}`,
      changes: buildFieldChanges({}, post.toObject(), AUDITABLE_BLOG_FIELDS),
      metadata: {
        isPublished: post.isPublished,
        slug: post.slug
      }
    })

    res.status(201).json(post)
  } catch (error) {
    console.error('Error creating blog post:', error)
    res.status(500).json({ message: 'Failed to create blog post', error: error.message })
  }
}

// @desc    Update blog post
// @route   PUT /api/blog/:id
// @access  Admin
export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params
    const { title, excerpt, content, coverImage, tags, isPublished, author, includeAuthor } = req.body

    const post = await BlogPost.findById(id)
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' })
    }

    const beforeSnapshot = AUDITABLE_BLOG_FIELDS.reduce((snapshot, field) => {
      snapshot[field] = post[field]
      return snapshot
    }, {})

    if (title && title !== post.title) {
      const baseSlug = createSlug(title)
      post.slug = await ensureUniqueSlug(baseSlug, post._id)
      post.title = title
    }

    if (excerpt !== undefined) post.excerpt = excerpt
    if (content !== undefined) post.content = content
    if (coverImage !== undefined) post.coverImage = coverImage
    if (tags !== undefined) {
      post.tags = Array.isArray(tags) ? tags.map((tag) => String(tag).trim()).filter(Boolean) : post.tags
    }

    if (typeof isPublished === 'boolean') {
      post.isPublished = isPublished
      post.publishedAt = isPublished ? post.publishedAt || new Date() : null
    }

    if (includeAuthor !== undefined || author !== undefined) {
      const defaultAuthorName = `${req.user?.firstName || ''} ${req.user?.lastName || ''}`.trim() || req.user?.email || ''
      const showAuthor = Boolean(includeAuthor)

      post.showAuthor = showAuthor
      post.authorName = showAuthor ? (typeof author === 'string' && author.trim() ? author.trim() : defaultAuthorName) : ''
    }

    await post.save()
    await post.populate('author', 'firstName lastName profilePicture')

    const changedFields = AUDITABLE_BLOG_FIELDS.filter((field) => JSON.stringify(beforeSnapshot[field] ?? null) !== JSON.stringify(post.toObject()[field] ?? null))

    await logAdminAction({
      req,
      action: 'blog.updated',
      targetType: 'blog_post',
      targetId: post._id,
      targetLabel: post.title || 'Untitled blog post',
      summary: `Updated blog post ${post.title || 'Untitled blog post'}`,
      changes: buildFieldChanges(beforeSnapshot, post.toObject(), changedFields),
      metadata: {
        updatedFields: changedFields,
        isPublished: post.isPublished,
        slug: post.slug
      }
    })

    res.json(post)
  } catch (error) {
    console.error('Error updating blog post:', error)
    res.status(500).json({ message: 'Failed to update blog post', error: error.message })
  }
}

// @desc    Publish or unpublish blog post
// @route   PATCH /api/blog/:id/publish
// @access  Admin
export const toggleBlogPostPublish = async (req, res) => {
  try {
    const { id } = req.params

    const post = await BlogPost.findById(id)
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' })
    }

    const beforeSnapshot = {
      isPublished: post.isPublished,
      publishedAt: post.publishedAt
    }

    post.isPublished = !post.isPublished
    post.publishedAt = post.isPublished ? new Date() : null

    await post.save()
    await post.populate('author', 'firstName lastName profilePicture')

    await logAdminAction({
      req,
      action: post.isPublished ? 'blog.published' : 'blog.unpublished',
      targetType: 'blog_post',
      targetId: post._id,
      targetLabel: post.title || 'Untitled blog post',
      summary: `${post.isPublished ? 'Published' : 'Unpublished'} blog post ${post.title || 'Untitled blog post'}`,
      changes: buildFieldChanges(beforeSnapshot, post.toObject(), ['isPublished', 'publishedAt']),
      metadata: {
        slug: post.slug
      }
    })

    res.json({
      message: `Blog post ${post.isPublished ? 'published' : 'unpublished'}`,
      post
    })
  } catch (error) {
    console.error('Error toggling blog publish state:', error)
    res.status(500).json({ message: 'Failed to update publish state', error: error.message })
  }
}

// @desc    Delete blog post
// @route   DELETE /api/blog/:id
// @access  Admin
export const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params

    const post = await BlogPost.findById(id)
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' })
    }

    const targetLabel = post.title || 'Untitled blog post'
    const metadata = {
      slug: post.slug,
      wasPublished: post.isPublished
    }

    await BlogPost.findByIdAndDelete(id)

    await logAdminAction({
      req,
      action: 'blog.deleted',
      targetType: 'blog_post',
      targetId: post._id,
      targetLabel,
      summary: `Deleted blog post ${targetLabel}`,
      metadata
    })

    res.json({ message: 'Blog post deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    res.status(500).json({ message: 'Failed to delete blog post', error: error.message })
  }
}
