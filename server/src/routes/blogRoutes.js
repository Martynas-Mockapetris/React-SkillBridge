import express from 'express'
import { protect, requirePermission } from '../middleware/authMiddleware.js'
import { PERMISSIONS } from '../utils/permissions.js'
import { getPublishedBlogPosts, getPublishedBlogPostBySlug, getAllBlogPostsAdmin, createBlogPost, updateBlogPost, toggleBlogPostPublish, deleteBlogPost } from '../controllers/blogController.js'

const router = express.Router()

// Public routes
router.get('/', getPublishedBlogPosts)
router.get('/admin/all', protect, requirePermission(PERMISSIONS.BLOG_READ_ADMIN), getAllBlogPostsAdmin)
router.get('/:slug', getPublishedBlogPostBySlug)

// Admin routes
router.post('/', protect, requirePermission(PERMISSIONS.BLOG_WRITE), createBlogPost)
router.put('/:id', protect, requirePermission(PERMISSIONS.BLOG_WRITE), updateBlogPost)
router.patch('/:id/publish', protect, requirePermission(PERMISSIONS.BLOG_WRITE), toggleBlogPostPublish)
router.delete('/:id', protect, requirePermission(PERMISSIONS.BLOG_WRITE), deleteBlogPost)

export default router
