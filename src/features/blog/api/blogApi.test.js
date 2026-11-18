import { describe, it, expect, vi } from 'vitest'
import {
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
} from './blogApi'
import defaultBlogApi from './blogApi'
import * as apiHelper from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  apiRequest: vi.fn(),
}))

describe('blogApi', () => {
  it('getPublicPosts builds query string correctly', async () => {
    apiHelper.get.mockResolvedValue({ status: 'success' })

    await getPublicPosts({ search: 'golang', category: 'Teknologi', page: 1, limit: 10 })
    expect(apiHelper.get).toHaveBeenCalledWith('/api/posts?search=golang&category=Teknologi&page=1&limit=10')

    await getPublicPosts({ category: 'Semua' })
    expect(apiHelper.get).toHaveBeenCalledWith('/api/posts')

    await getPublicPosts()
    expect(apiHelper.get).toHaveBeenCalledWith('/api/posts')
  })

  it('calls detail, categories, and author CRUD endpoints', async () => {
    apiHelper.get.mockResolvedValue({ status: 'success' })
    apiHelper.post.mockResolvedValue({ status: 'success' })
    apiHelper.put.mockResolvedValue({ status: 'success' })
    apiHelper.del.mockResolvedValue({ status: 'success' })
    apiHelper.apiRequest.mockResolvedValue({ status: 'success' })

    await getPublicPostBySlug('test-slug')
    expect(apiHelper.get).toHaveBeenCalledWith('/api/posts/test-slug')

    await getCategories()
    expect(apiHelper.get).toHaveBeenCalledWith('/api/posts/categories')

    await getAuthorPosts()
    expect(apiHelper.get).toHaveBeenCalledWith('/api/posts/author')

    await createPost({ title: 'New' })
    expect(apiHelper.post).toHaveBeenCalledWith('/api/posts/author', { title: 'New' })

    await updatePost(1, { title: 'Updated' })
    expect(apiHelper.put).toHaveBeenCalledWith('/api/posts/author/1', { title: 'Updated' })

    await deletePost(1)
    expect(apiHelper.del).toHaveBeenCalledWith('/api/posts/author/1')

    await togglePublishPost(1)
    expect(apiHelper.apiRequest).toHaveBeenCalledWith('/api/posts/author/1/toggle', { method: 'PATCH' })

    await getPostStats()
    expect(apiHelper.get).toHaveBeenCalledWith('/api/posts/author/stats')
  })

  it('calls generateAiPost with search option', async () => {
    apiHelper.post.mockResolvedValue({ status: 'success' })

    await generateAiPost('My Topic', true)
    expect(apiHelper.post).toHaveBeenCalledWith('/api/ai/generate', {
      prompt: 'My Topic',
      use_search: true,
    })

    await generateAiPost('Topic 2')
    expect(apiHelper.post).toHaveBeenCalledWith('/api/ai/generate', {
      prompt: 'Topic 2',
      use_search: false,
    })

    // default export
    expect(defaultBlogApi.getPublicPosts).toBe(getPublicPosts)
    expect(defaultBlogApi.getPublicPostBySlug).toBe(getPublicPostBySlug)
    expect(defaultBlogApi.getCategories).toBe(getCategories)
    expect(defaultBlogApi.getAuthorPosts).toBe(getAuthorPosts)
    expect(defaultBlogApi.createPost).toBe(createPost)
    expect(defaultBlogApi.updatePost).toBe(updatePost)
    expect(defaultBlogApi.deletePost).toBe(deletePost)
    expect(defaultBlogApi.togglePublishPost).toBe(togglePublishPost)
    expect(defaultBlogApi.getPostStats).toBe(getPostStats)
    expect(defaultBlogApi.generateAiPost).toBe(generateAiPost)
  })
})
