import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PublicArticleDetail } from './PublicArticleDetail'
import defaultPublicArticleDetail from './PublicArticleDetail'
import * as blogApi from '../api/blogApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi', () => ({
  getPublicPostBySlug: vi.fn(),
}))

vi.mock('../../../helpers/toolsHelper', () => ({
  formatDate: vi.fn((d) => '18 November 2026'),
  showToast: vi.fn(),
}))

vi.mock('../../../components/MarkdownViewer', () => ({
  MarkdownViewer: ({ content }) => <div data-testid="mock-markdown-viewer">{content}</div>,
}))

const mockPost = {
  id: 1,
  title: 'Panduan Golang Gin',
  slug: 'panduan-golang-gin',
  category: 'Teknologi',
  tags: 'golang, gin',
  content: 'Konten lengkap markdown...',
  cover_image: 'https://example.com/cover.jpg',
  reading_time: 4,
  author: { username: 'john_doe' },
  published_at: '2026-11-18T00:00:00Z',
}

describe('PublicArticleDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    })
  })

  it('renders detail using initial post prop', () => {
    const onBack = vi.fn()
    render(<PublicArticleDetail post={mockPost} onBack={onBack} />)

    expect(screen.getByTestId('public-article-detail')).toBeInTheDocument()
    expect(screen.getByText('Panduan Golang Gin')).toBeInTheDocument()
    expect(screen.getByText('john_doe')).toBeInTheDocument()
    expect(screen.getByText('4 menit baca')).toBeInTheDocument()
    expect(screen.getByText('#golang')).toBeInTheDocument()
    expect(screen.getByTestId('mock-markdown-viewer')).toBeInTheDocument()

    // Test back button
    fireEvent.click(screen.getByRole('button', { name: /Kembali ke Galeri/i }))
    expect(onBack).toHaveBeenCalled()

    // Test share button
    fireEvent.click(screen.getByRole('button', { name: /Bagikan/i }))
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(toolsHelper.showToast).toHaveBeenCalledWith('Tautan artikel disalin ke clipboard!')

    // Test image error
    const img = screen.getByAltText('Panduan Golang Gin')
    fireEvent.error(img)
    expect(img.style.display).toBe('none')

    expect(defaultPublicArticleDetail).toBe(PublicArticleDetail)
  })

  it('fetches post by slug when post prop is not provided', async () => {
    blogApi.getPublicPostBySlug.mockResolvedValueOnce({
      status: 'success',
      data: { post: mockPost },
    })

    render(<PublicArticleDetail slug="panduan-golang-gin" />)

    await waitFor(() => {
      expect(screen.getByText('Panduan Golang Gin')).toBeInTheDocument()
    })
  })

  it('renders error/not found state and handles back', async () => {
    blogApi.getPublicPostBySlug.mockRejectedValueOnce(new Error('Artikel 404'))
    const onBack = vi.fn()

    render(<PublicArticleDetail slug="not-found" onBack={onBack} />)

    await waitFor(() => {
      expect(screen.getByText('Artikel 404')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Kembali ke Beranda/i }))
    expect(onBack).toHaveBeenCalled()

    // Test error without message
    blogApi.getPublicPostBySlug.mockRejectedValueOnce({})
    render(<PublicArticleDetail slug="no-msg" />)
    await waitFor(() => {
      expect(screen.getByText('Gagal memuat artikel.')).toBeInTheDocument()
    })
  })

  it('handles post without optional fields and empty post response', async () => {
    // 1. Empty post response
    blogApi.getPublicPostBySlug.mockResolvedValueOnce({
      status: 'success',
      data: { post: null },
    })

    const { unmount } = render(<PublicArticleDetail slug="kosong" />)

    await waitFor(() => {
      expect(screen.getByText('Artikel tidak ditemukan.')).toBeInTheDocument()
    })
    unmount()

    // 2. Post with empty author, category, reading_time, published_at, tags with whitespace/empty
    const minimalPost = {
      id: 2,
      title: 'Minimal Post',
      slug: 'minimal-post',
      category: null,
      tags: 'tag1, , tag2, ',
      content: 'Minimal content',
      cover_image: null,
      reading_time: 0,
      author: null,
      published_at: null,
      created_at: '2026-11-18T00:00:00Z',
    }

    render(<PublicArticleDetail post={minimalPost} />)
    expect(screen.getByText('Minimal Post')).toBeInTheDocument()
    expect(screen.getByText('Umum')).toBeInTheDocument()
    expect(screen.getByText('1 menit baca')).toBeInTheDocument()
    expect(screen.getByText('Penulis')).toBeInTheDocument()
    expect(screen.getByText('P')).toBeInTheDocument()
    expect(screen.getByText('#tag1')).toBeInTheDocument()
    expect(screen.getByText('#tag2')).toBeInTheDocument()
  })

  it('renders nothing when slug and initialPost are omitted', () => {
    render(<PublicArticleDetail />)
    expect(screen.getByText('Artikel Tidak Ditemukan')).toBeInTheDocument()
  })
})
