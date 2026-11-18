import { get, post, put, del, apiRequest } from '../../../helpers/apiHelper'

export const getPublicPosts = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.search) query.append('search', params.search)
  if (params.category && params.category !== 'Semua') query.append('category', params.category)
  if (params.page) query.append('page', params.page)
  if (params.limit) query.append('limit', params.limit)

  const queryString = query.toString()
  const url = `/api/public/posts${queryString ? `?${queryString}` : ''}`
  return await get(url)
}

export const getPublicPostBySlug = async (slug) => {
  return await get(`/api/public/posts/${slug}`)
}

export const getCategories = async () => {
  return await get('/api/public/categories')
}

export const getAuthorPosts = async () => {
  return await get('/api/posts')
}

export const createPost = async (postData) => {
  return await post('/api/posts', postData)
}

export const updatePost = async (id, postData) => {
  return await put(`/api/posts/${id}`, postData)
}

export const deletePost = async (id) => {
  return await del(`/api/posts/${id}`)
}

export const togglePublishPost = async (id) => {
  return await apiRequest(`/api/posts/${id}/toggle-publish`, { method: 'PATCH' })
}

export const getPostStats = async () => {
  return await get('/api/posts/stats')
}

export const generateAiPost = async (prompt, useSearch = false) => {
  return await post('/api/posts/ai-generate', { prompt, use_search: useSearch })
}

export default {
  getPublicPosts,
  getPublicPostBySlug,
  getCategories,
  getAuthorPosts,
  createPost,
  updatePost,
  deletePost,
  togglePublishPost,
  getPostStats,
  generateAiPost,
}
