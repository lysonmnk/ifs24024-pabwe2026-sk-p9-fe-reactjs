import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PublicArticleList } from './PublicArticleList'
import defaultPublicArticleList from './PublicArticleList'
import * as blogApi from '../api/blogApi'

vi.mock('../api/blogApi', () => ({
  getPublicPosts: vi.fn(),
}))

const mockPosts = [
  {
    id: 1,
    title: 'Belajar Golang Gin',
    slug: 'belajar-golang-gin',
    category: 'Teknologi',
    tags: 'go,gin',
    excerpt: 'Panduan awal belajar golang gin.',
    content: 'Isi lengkap artikel belajar golang gin...',
    cover_image: 'https://example.com/cover1.jpg',
    reading_time: 3,
    is_published: true,
    created_at: '2026-11-18T00:00:00Z',
    published_at: '2026-11-18T00:00:00Z',
    author: { username: 'penulis1' },
  },
  {
    id: 2,
    title: 'Pendidikan Karakter',
    slug: 'pendidikan-karakter',
    category: 'Pendidikan',
    tags: 'pendidikan',
    excerpt: '',
    content: 'Isi konten tanpa excerpt...',
    cover_image: '',
    reading_time: 2,
    is_published: true,
    created_at: '2026-11-18T00:00:00Z',
    author: null,
  },
]

describe('PublicArticleList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders articles and handles selection and navigation', async () => {
    blogApi.getPublicPosts.mockResolvedValueOnce({
      status: 'success',
      data: { posts: mockPosts },
    })

    const onSelectArticle = vi.fn()
    render(<PublicArticleList onSelectArticle={onSelectArticle} />)

    expect(screen.getByTestId('public-article-list')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Belajar Golang Gin')).toBeInTheDocument()
      expect(screen.getByText('Pendidikan Karakter')).toBeInTheDocument()
    })

    // Click first article
    fireEvent.click(screen.getByText('Belajar Golang Gin'))
    expect(onSelectArticle).toHaveBeenCalledWith(mockPosts[0])

    // Test image error handler
    const img = screen.getByAltText('Belajar Golang Gin')
    fireEvent.error(img)
    expect(img.style.display).toBe('none')

    expect(defaultPublicArticleList).toBe(PublicArticleList)
  })

  it('navigates with onNavigate when onSelectArticle is not provided', async () => {
    blogApi.getPublicPosts.mockResolvedValueOnce({
      status: 'success',
      data: { posts: mockPosts },
    })

    const onNavigate = vi.fn()
    render(<PublicArticleList onNavigate={onNavigate} />)

    await waitFor(() => {
      expect(screen.getByText('Belajar Golang Gin')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Belajar Golang Gin'))
    expect(onNavigate).toHaveBeenCalledWith('/posts/belajar-golang-gin')
  })

  it('handles category pill filter click', async () => {
    blogApi.getPublicPosts.mockResolvedValue({
      status: 'success',
      data: { posts: [] },
    })

    render(<PublicArticleList />)

    fireEvent.click(screen.getByRole('button', { name: 'Teknologi' }))
    await waitFor(() => {
      expect(blogApi.getPublicPosts).toHaveBeenCalledWith({
        search: '',
        category: 'Teknologi',
      })
    })
  })

  it('handles empty state with and without search term', async () => {
    blogApi.getPublicPosts.mockResolvedValueOnce({
      status: 'success',
      data: { posts: [] },
    })

    const { rerender } = render(<PublicArticleList searchTerm="" />)

    await waitFor(() => {
      expect(screen.getByText(/Tidak ada artikel ditemukan/i)).toBeInTheDocument()
      expect(screen.getByText(/Belum ada artikel yang diterbitkan/i)).toBeInTheDocument()
    })

    blogApi.getPublicPosts.mockResolvedValueOnce({
      status: 'success',
      data: { posts: [] },
    })
    rerender(<PublicArticleList searchTerm="reactjs" />)

    await waitFor(() => {
      expect(screen.getByText(/Tidak ada artikel yang cocok dengan kata kunci "reactjs"/i)).toBeInTheDocument()
    })
  })

  it('handles error state and retries on button click', async () => {
    blogApi.getPublicPosts.mockRejectedValueOnce({})

    render(<PublicArticleList />)

    await waitFor(() => {
      expect(screen.getByText('Gagal memuat artikel')).toBeInTheDocument()
    })

    blogApi.getPublicPosts.mockResolvedValueOnce({
      status: 'success',
      data: { posts: mockPosts },
    })

    fireEvent.click(screen.getByRole('button', { name: /Coba Lagi/i }))

    await waitFor(() => {
      expect(screen.getByText('Belajar Golang Gin')).toBeInTheDocument()
    })
  })

  it('handles non-array response and clicking article without callback handlers', async () => {
    // 1. Non-array response
    blogApi.getPublicPosts.mockResolvedValueOnce({
      status: 'success',
      data: null,
    })

    const { unmount } = render(<PublicArticleList />)
    await waitFor(() => {
      expect(screen.getByText(/Tidak ada artikel ditemukan/i)).toBeInTheDocument()
    })
    unmount()

    // 2. Click article without handlers, empty content and category
    blogApi.getPublicPosts.mockResolvedValueOnce({
      status: 'success',
      data: {
        posts: [{
          id: 3,
          title: 'Empty Article',
          slug: 'empty-article',
          category: '',
          content: '',
          reading_time: 0,
          cover_image: '',
          created_at: '2026-11-18T00:00:00Z',
          published_at: null,
        }],
      },
    })

    render(<PublicArticleList />)
    await waitFor(() => {
      expect(screen.getByText('Empty Article')).toBeInTheDocument()
    })

    // Click article card without onSelectArticle or onNavigate
    fireEvent.click(screen.getByText('Empty Article'))
    // should not throw
  })
})
