import express from 'express'
import { protect, adminOnly } from '../middleware/authMiddleware.js'
import { getPublishedBlogPosts, getPublishedBlogPostBySlug, getAllBlogPostsAdmin, createBlogPost, updateBlogPost, toggleBlogPostPublish, deleteBlogPost } from '../controllers/blogController.js'

const router = express.Router()

router.get('/', getPublishedBlogPosts)
router.get('/admin/all', protect, adminOnly, getAllBlogPostsAdmin)
router.get('/:slug', getPublishedBlogPostBySlug)

router.post('/', protect, adminOnly, createBlogPost)
router.put('/:id', protect, adminOnly, updateBlogPost)
router.patch('/:id/publish', protect, adminOnly, toggleBlogPostPublish)
router.delete('/:id', protect, adminOnly, deleteBlogPost)

export default router
