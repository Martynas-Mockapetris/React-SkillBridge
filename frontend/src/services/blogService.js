import axios from 'axios'
import { authAxios } from '../utils/axiosConfig'

// Public: get all published blog posts
export const getPublishedBlogPosts = async () => {
  try {
    const response = await axios.get('/api/blog')
    return response.data
  } catch (error) {
    console.error('Failed to fetch published blog posts:', error.response?.data || error.message)
    throw error
  }
}

// Public: get one published blog post by slug
export const getPublishedBlogPostBySlug = async (slug) => {
  try {
    const response = await axios.get(`/api/blog/${slug}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch blog post by slug:', error.response?.data || error.message)
    throw error
  }
}

// Admin: get all blog posts
export const getAdminBlogPosts = async () => {
  try {
    const response = await authAxios.get('/api/blog/admin/all')
    return response.data
  } catch (error) {
    console.error('Failed to fetch admin blog posts:', error.response?.data || error.message)
    throw error
  }
}

// Admin: create blog post
export const createBlogPost = async (payload) => {
  try {
    const response = await authAxios.post('/api/blog', payload)
    return response.data
  } catch (error) {
    console.error('Failed to create blog post:', error.response?.data || error.message)
    throw error
  }
}

// Admin: update blog post
export const updateBlogPost = async (postId, payload) => {
  try {
    const response = await authAxios.put(`/api/blog/${postId}`, payload)
    return response.data
  } catch (error) {
    console.error('Failed to update blog post:', error.response?.data || error.message)
    throw error
  }
}

// Admin: publish or unpublish blog post
export const toggleBlogPostPublish = async (postId) => {
  try {
    const response = await authAxios.patch(`/api/blog/${postId}/publish`)
    return response.data
  } catch (error) {
    console.error('Failed to toggle blog post publish state:', error.response?.data || error.message)
    throw error
  }
}

// Admin: delete blog post
export const deleteBlogPost = async (postId) => {
  try {
    const response = await authAxios.delete(`/api/blog/${postId}`)
    return response.data
  } catch (error) {
    console.error('Failed to delete blog post:', error.response?.data || error.message)
    throw error
  }
}
