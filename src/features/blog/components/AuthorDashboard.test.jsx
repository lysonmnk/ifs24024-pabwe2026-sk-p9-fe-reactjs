import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthorDashboard } from './AuthorDashboard'
import defaultAuthorDashboard from './AuthorDashboard'
import * as blogApi from '../api/blogApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi', () => ({
  getAuthorPosts: vi.fn(),
  getPostStats: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
  togglePublishPost: vi.fn(),
}))

vi.mock('../../../helpers/toolsHelper', () => ({
  formatDate: vi.fn(() => '18 Nov 2026'),
  showConfirm: vi.fn(),
  showToast: vi.fn(),
  showAlert: vi.fn(),
}))

vi.mock('../modals/PostModal', () => ({
  PostModal: ({ isOpen, onClose, onSubmit, initialData }) =>
    isOpen ? (
      <div data-testid="mock-post-modal">
        <span>Modal Open</span>
        <button onClick={onClose}>Tutup Modal</button>
        <button
          onClick={() =>
            onSubmit({
              title: initialData ? 'Updated Title' : 'New Post Title',
              category: 'Teknologi',
              content: 'Content',
            })
          }
        >
          Kirim Modal
        </button>
      </div>
    ) : null,
}))

vi.mock('../modals/AiPostGeneratorModal', () => ({
  AiPostGeneratorModal: ({ isOpen, onClose, onApplyDraft }) =>
    isOpen ? (
      <div data-testid="mock-ai-modal">
        <span>AI Modal Open</span>
        <button onClick={onClose}>Tutup AI</button>
        <button
          onClick={() =>
            onApplyDraft({
              title: 'AI Draft Title',
              category: 'Bisnis',
              tags: 'bisnis',
              content: 'Draft content...',
            })
          }
        >
          Terapkan AI
        </button>
        <button onClick={() => onApplyDraft({})}>Terapkan Draf Kosong</button>
      </div>
    ) : null,
}))

const mockPosts = [
  {
    id: 1,
    title: 'Post Pertama',
    slug: 'post-pertama',
    category: 'Teknologi',
    tags: 'tech',
    content: 'Isi post 1',
    is_published: true,
    reading_time: 2,
    created_at: '2026-11-18T00:00:00Z',
  },
  {
    id: 2,
    title: 'Post Kedua',
    slug: 'post-kedua',
    category: 'Umum',
    tags: 'umum',
    content: 'Isi post 2',
    is_published: false,
    reading_time: 1,
    created_at: '2026-11-18T00:00:00Z',
  },
]

describe('AuthorDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders author workspace, loads posts and stats, and handles toggle publish', async () => {
    blogApi.getAuthorPosts.mockResolvedValue({
      status: 'success',
      data: { posts: mockPosts },
    })
    blogApi.getPostStats.mockResolvedValue({
      status: 'success',
      data: { total: 2, published: 1, drafts: 1 },
    })
    blogApi.togglePublishPost.mockResolvedValue({ status: 'success' })

    render(<AuthorDashboard user={{ id: 1, username: 'author1' }} />)

    expect(screen.getByTestId('author-dashboard')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Post Pertama')).toBeInTheDocument()
      expect(screen.getByText('Post Kedua')).toBeInTheDocument()
    })

    // Toggle publish
    const toggleButtons = screen.getAllByTitle(/Klik untuk mengubah status/i)
    fireEvent.click(toggleButtons[0]) // was published (true), will toggle

    await waitFor(() => {
      expect(blogApi.togglePublishPost).toHaveBeenCalledWith(1)
      expect(toolsHelper.showToast).toHaveBeenCalledWith('Artikel diubah menjadi draf.')
    })

    // Toggle second post (was draft)
    const freshToggleButtons = screen.getAllByTitle(/Klik untuk mengubah status/i)
    fireEvent.click(freshToggleButtons[1])
    await waitFor(() => {
      expect(blogApi.togglePublishPost).toHaveBeenCalledWith(2)
      expect(toolsHelper.showToast).toHaveBeenCalledWith('Artikel berhasil diterbitkan!')
    })

    expect(defaultAuthorDashboard).toBe(AuthorDashboard)
  })

  it('handles toggle publish failure', async () => {
    blogApi.getAuthorPosts.mockResolvedValueOnce({
      status: 'success',
      data: { posts: mockPosts },
    })
    blogApi.getPostStats.mockResolvedValueOnce({
      status: 'success',
      data: { total: 2, published: 1, drafts: 1 },
    })
    blogApi.togglePublishPost.mockRejectedValueOnce(new Error('Toggle error'))

    render(<AuthorDashboard user={{ id: 1, username: 'author1' }} />)

    await waitFor(() => {
      expect(screen.getByText('Post Pertama')).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByTitle(/Klik untuk mengubah status/i)[0])
    await waitFor(() => {
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Gagal', 'Toggle error', 'error')
    })

    // Toggle error without message
    blogApi.togglePublishPost.mockRejectedValueOnce({})
    fireEvent.click(screen.getAllByTitle(/Klik untuk mengubah status/i)[0])
    await waitFor(() => {
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Gagal', 'Tidak dapat mengubah status artikel.', 'error')
    })
  })

  it('handles kebab actions: view, edit, delete with confirm and cancel', async () => {
    blogApi.getAuthorPosts.mockResolvedValue({
      status: 'success',
      data: { posts: mockPosts },
    })
    blogApi.getPostStats.mockResolvedValue({
      status: 'success',
      data: { total: 2, published: 1, drafts: 1 },
    })
    blogApi.updatePost.mockResolvedValue({ status: 'success' })
    blogApi.deletePost.mockResolvedValue({ status: 'success' })

    const onNavigate = vi.fn()
    render(<AuthorDashboard user={{ id: 1, username: 'author1' }} onNavigate={onNavigate} />)

    await waitFor(() => {
      expect(screen.getByText('Post Pertama')).toBeInTheDocument()
    })

    // Open kebab menu of post 1
    const kebabButtons = screen.getAllByLabelText(/Tindakan/i)
    fireEvent.click(kebabButtons[0])

    // View action
    fireEvent.click(screen.getByRole('button', { name: /Lihat Artikel/i }))
    expect(onNavigate).toHaveBeenCalledWith('/posts/post-pertama')

    // Reopen kebab for edit
    fireEvent.click(kebabButtons[0])
    fireEvent.click(screen.getByRole('button', { name: /Edit Artikel/i }))
    expect(screen.getByTestId('mock-post-modal')).toBeInTheDocument()

    // Submit edit
    fireEvent.click(screen.getByRole('button', { name: /Kirim Modal/i }))
    await waitFor(() => {
      expect(blogApi.updatePost).toHaveBeenCalledWith(1, expect.any(Object))
      expect(toolsHelper.showToast).toHaveBeenCalledWith('Artikel berhasil diperbarui!')
      expect(screen.getByText('Post Pertama')).toBeInTheDocument()
    })

    // Reopen kebab for delete - cancelled
    toolsHelper.showConfirm.mockResolvedValueOnce(false)
    fireEvent.click(screen.getAllByLabelText(/Tindakan/i)[0])
    fireEvent.click(screen.getByRole('button', { name: /Hapus Artikel/i }))
    expect(blogApi.deletePost).not.toHaveBeenCalled()

    // Reopen kebab for delete - confirmed
    toolsHelper.showConfirm.mockResolvedValueOnce(true)
    fireEvent.click(screen.getAllByLabelText(/Tindakan/i)[0])
    fireEvent.click(screen.getByRole('button', { name: /Hapus Artikel/i }))
    await waitFor(() => {
      expect(blogApi.deletePost).toHaveBeenCalledWith(1)
      expect(toolsHelper.showToast).toHaveBeenCalledWith('Artikel berhasil dihapus.')
    })
  })

  it('handles delete failure', async () => {
    blogApi.getAuthorPosts.mockResolvedValue({
      status: 'success',
      data: { posts: mockPosts },
    })
    blogApi.getPostStats.mockResolvedValue({
      status: 'success',
      data: { total: 2, published: 1, drafts: 1 },
    })
    blogApi.deletePost.mockRejectedValueOnce(new Error('Delete error'))
    toolsHelper.showConfirm.mockResolvedValue(true)

    render(<AuthorDashboard user={{ id: 1, username: 'author1' }} />)

    await waitFor(() => {
      expect(screen.getByText('Post Pertama')).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByLabelText(/Tindakan/i)[0])
    fireEvent.click(screen.getByRole('button', { name: /Hapus Artikel/i }))

    await waitFor(() => {
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Gagal', 'Delete error', 'error')
    })

    // Delete error without message
    blogApi.deletePost.mockRejectedValueOnce({})
    fireEvent.click(screen.getAllByLabelText(/Tindakan/i)[0])
    fireEvent.click(screen.getByRole('button', { name: /Hapus Artikel/i }))
    await waitFor(() => {
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Gagal', 'Tidak dapat menghapus artikel.', 'error')
    })
  })

  it('handles create post and AI generator flow', async () => {
    blogApi.getAuthorPosts.mockResolvedValue({
      status: 'success',
      data: { posts: mockPosts },
    })
    blogApi.getPostStats.mockResolvedValue({
      status: 'success',
      data: { total: 2, published: 1, drafts: 1 },
    })
    blogApi.createPost.mockResolvedValue({ status: 'success' })

    render(<AuthorDashboard user={{ id: 1, username: 'author1' }} />)

    await waitFor(() => {
      expect(screen.getByText('Post Pertama')).toBeInTheDocument()
    })

    // Tambah Artikel button
    fireEvent.click(screen.getByRole('button', { name: /Tambah Artikel/i }))
    expect(screen.getByTestId('mock-post-modal')).toBeInTheDocument()

    // Submit new post
    fireEvent.click(screen.getByRole('button', { name: /Kirim Modal/i }))
    await waitFor(() => {
      expect(blogApi.createPost).toHaveBeenCalled()
      expect(toolsHelper.showToast).toHaveBeenCalledWith('Artikel berhasil dibuat!')
    })

    // Open AI Generator
    fireEvent.click(screen.getByRole('button', { name: /AI Generator/i }))
    expect(screen.getByTestId('mock-ai-modal')).toBeInTheDocument()

    // Apply AI draft
    fireEvent.click(screen.getByRole('button', { name: /Terapkan AI/i }))
    expect(screen.getByTestId('mock-post-modal')).toBeInTheDocument()

    // Close modal
    fireEvent.click(screen.getByRole('button', { name: /Tutup Modal/i }))
    expect(screen.queryByTestId('mock-post-modal')).not.toBeInTheDocument()

    // Reopen AI generator and apply empty draft
    fireEvent.click(screen.getByRole('button', { name: /AI Generator/i }))
    fireEvent.click(screen.getByRole('button', { name: /Terapkan Draf Kosong/i }))
    expect(screen.getByTestId('mock-post-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Tutup Modal/i }))
  })

  it('handles empty state and error state in dashboard', async () => {
    blogApi.getAuthorPosts.mockRejectedValueOnce({})
    blogApi.getPostStats.mockResolvedValueOnce({ status: 'success', data: { total: 0 } })

    const { rerender } = render(<AuthorDashboard user={{ id: 1, username: 'author1' }} />)

    await waitFor(() => {
      expect(screen.getByText('Gagal memuat data workspace.')).toBeInTheDocument()
    })

    // Reload with empty posts
    blogApi.getAuthorPosts.mockResolvedValueOnce({ status: 'success', data: { posts: [] } })
    blogApi.getPostStats.mockResolvedValueOnce({ status: 'success', data: { total: 0 } })

    fireEvent.click(screen.getByTitle(/Muat Ulang/i))

    await waitFor(() => {
      expect(screen.getByText(/Anda belum memiliki artikel/i)).toBeInTheDocument()
    })

    // Click "Tulis Artikel Sekarang" in empty state
    fireEvent.click(screen.getByRole('button', { name: /Tulis Artikel Sekarang/i }))
    expect(screen.getByTestId('mock-post-modal')).toBeInTheDocument()
  })

  it('handles fallback non-array posts, toggling kebab menu, and close AI modal', async () => {
    blogApi.getAuthorPosts.mockResolvedValueOnce({ status: 'success', data: null })
    blogApi.getPostStats.mockResolvedValueOnce({ status: 'success', data: null })

    const { unmount } = render(<AuthorDashboard user={{ id: 1, username: 'author1' }} />)

    await waitFor(() => {
      expect(screen.getByText(/Anda belum memiliki artikel/i)).toBeInTheDocument()
    })
    unmount()

    // Render with post, toggle kebab on then off, close AI modal, and view post without onNavigate
    blogApi.getAuthorPosts.mockResolvedValueOnce({
      status: 'success',
      data: {
        posts: [{
          id: 5,
          title: 'Post Kebab',
          slug: 'post-kebab',
          category: null,
          reading_time: 0,
          is_published: true,
          created_at: '2026-11-18T00:00:00Z',
        }],
      },
    })
    blogApi.getPostStats.mockResolvedValueOnce({ status: 'success', data: { total: 1 } })

    render(<AuthorDashboard user={{ id: 1, username: 'author1' }} />)

    await waitFor(() => {
      expect(screen.getByText('Post Kebab')).toBeInTheDocument()
      expect(screen.getByText('Umum')).toBeInTheDocument()
      expect(screen.getByText('1 menit')).toBeInTheDocument()
    })

    // Toggle kebab on then off
    const kebabBtn = screen.getByLabelText(/Tindakan/i)
    fireEvent.click(kebabBtn)
    expect(screen.getByRole('button', { name: /Lihat Artikel/i })).toBeInTheDocument()
    // Click "Lihat Artikel" without onNavigate
    fireEvent.click(screen.getByRole('button', { name: /Lihat Artikel/i }))

    // Open kebab then toggle off by clicking kebab button again
    fireEvent.click(kebabBtn)
    expect(screen.getByRole('button', { name: /Lihat Artikel/i })).toBeInTheDocument()
    fireEvent.click(kebabBtn)
    expect(screen.queryByRole('button', { name: /Lihat Artikel/i })).not.toBeInTheDocument()

    // Open and close AI modal
    fireEvent.click(screen.getByRole('button', { name: /AI Generator/i }))
    expect(screen.getByTestId('mock-ai-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Tutup AI/i }))
    expect(screen.queryByTestId('mock-ai-modal')).not.toBeInTheDocument()
  })
})
