import { get, post, put, del, apiRequest } from '../../../helpers/apiHelper'

export const getPublicPosts = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.search) query.append('search', params.search)
  if (params.category && params.category !== 'Semua') query.append('category', params.category)
  if (params.page) query.append('page', params.page)
  if (params.limit) query.append('limit', params.limit)

  const queryString = query.toString()
  const url = `/api/posts${queryString ? `?${queryString}` : ''}`
  return await get(url)
}

export const getPublicPostBySlug = async (slug) => {
  return await get(`/api/posts/${slug}`)
}

export const getCategories = async () => {
  return await get('/api/posts/categories')
}

export const getAuthorPosts = async () => {
  return await get('/api/posts/author')
}

export const createPost = async (postData) => {
  return await post('/api/posts/author', postData)
}

export const updatePost = async (id, postData) => {
  return await put(`/api/posts/author/${id}`, postData)
}

export const deletePost = async (id) => {
  return await del(`/api/posts/author/${id}`)
}

export const togglePublishPost = async (id) => {
  return await apiRequest(`/api/posts/author/${id}/toggle`, { method: 'PATCH' })
}

export const getPostStats = async () => {
  return await get('/api/posts/author/stats')
}

export const generateAiPost = async (prompt, useSearch = false) => {
  return await post('/api/ai/generate', { prompt, use_search: useSearch })
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
