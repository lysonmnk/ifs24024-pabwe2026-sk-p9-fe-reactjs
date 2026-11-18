import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdminDashboard } from './AdminDashboard'
import defaultAdminDashboard from './AdminDashboard'
import * as adminApi from '../api/adminApi'

vi.mock('../api/adminApi', () => ({
  getAllUsers: vi.fn(),
  getAllPosts: vi.fn(),
  getUserPosts: vi.fn(),
}))

vi.mock('../../../helpers/toolsHelper', () => ({
  formatDate: vi.fn(() => '18 Nov 2026'),
}))

const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@delcom.org',
    role: 'admin',
    total_posts: 5,
    published_posts: 4,
  },
  {
    id: 2,
    username: 'author1',
    email: 'author1@delcom.org',
    role: 'author',
    total_posts: 2,
    published_posts: 1,
  },
]

const mockPosts = [
  {
    id: 1,
    title: 'Post Sistem Terbit',
    slug: 'post-sistem-terbit',
    category: 'Teknologi',
    author_id: 1,
    author: { username: 'admin' },
    is_published: true,
    created_at: '2026-11-18T00:00:00Z',
  },
  {
    id: 2,
    title: 'Post Draf Sistem',
    slug: 'post-draf-sistem',
    category: 'Bisnis',
    author_id: 2,
    author: null,
    is_published: false,
    created_at: '2026-11-18T00:00:00Z',
  },
]

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.alert = vi.fn()
  })

  it('renders admin panel and switches tabs between users and posts', async () => {
    adminApi.getAllUsers.mockResolvedValue({
      status: 'success',
      data: { users: mockUsers },
    })
    adminApi.getAllPosts.mockResolvedValue({
      status: 'success',
      data: { posts: mockPosts },
    })

    const onNavigate = vi.fn()
    render(<AdminDashboard user={{ id: 1, role: 'admin' }} onNavigate={onNavigate} />)

    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument()

    // Verify Users tab
    await waitFor(() => {
      expect(screen.getByText('admin@delcom.org')).toBeInTheDocument()
      expect(screen.getByText('author1@delcom.org')).toBeInTheDocument()
    })

    // Switch to Posts tab
    fireEvent.click(screen.getByText(/Arsip Seluruh Artikel/i))
    await waitFor(() => {
      expect(screen.getByText('Post Sistem Terbit')).toBeInTheDocument()
      expect(screen.getByText('Post Draf Sistem')).toBeInTheDocument()
    })

    // Click Baca button on published post
    fireEvent.click(screen.getByRole('button', { name: /Baca/i }))
    expect(onNavigate).toHaveBeenCalledWith('/posts/post-sistem-terbit')

    // Click card stat to switch back to users
    fireEvent.click(screen.getByText(/Total Pengguna Terdaftar/i))
    expect(screen.getByText('admin@delcom.org')).toBeInTheDocument()

    // Click card stat to switch to posts
    fireEvent.click(screen.getByText(/Total Seluruh Postingan Sistem/i))
    expect(screen.getByText('Post Sistem Terbit')).toBeInTheDocument()

    // Switch back to users via tab button
    fireEvent.click(screen.getByRole('button', { name: /Direktori Pengguna/i }))
    expect(screen.getByText('admin@delcom.org')).toBeInTheDocument()

    expect(defaultAdminDashboard).toBe(AdminDashboard)
  })

  it('handles inspecting user posts in modal and closing modal', async () => {
    adminApi.getAllUsers.mockResolvedValue({
      status: 'success',
      data: { users: mockUsers },
    })
    adminApi.getAllPosts.mockResolvedValue({
      status: 'success',
      data: { posts: mockPosts },
    })
    adminApi.getUserPosts.mockResolvedValue({
      status: 'success',
      data: {
        user: mockUsers[1],
        posts: [mockPosts[0], mockPosts[1]],
      },
    })

    render(<AdminDashboard user={{ id: 1, role: 'admin' }} />)

    await waitFor(() => {
      expect(screen.getByText('author1@delcom.org')).toBeInTheDocument()
    })

    const detailButtons = screen.getAllByRole('button', { name: /Detail/i })
    fireEvent.click(detailButtons[1])

    await waitFor(() => {
      expect(adminApi.getUserPosts).toHaveBeenCalledWith(2)
      expect(screen.getByText(/Artikel Penulis: author1/i)).toBeInTheDocument()
      expect(screen.getByText('Post Sistem Terbit')).toBeInTheDocument()
      expect(screen.getByText('Post Draf Sistem')).toBeInTheDocument()
      expect(screen.getByText('Terbit')).toBeInTheDocument()
    })

    // Close modal via close button
    fireEvent.click(screen.getByRole('button', { name: /Tutup/i }))
    expect(screen.queryByText(/Artikel Penulis: author1/i)).not.toBeInTheDocument()

    // Reopen and close via X button
    fireEvent.click(detailButtons[1])
    await waitFor(() => {
      expect(screen.getByText(/Artikel Penulis: author1/i)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('✕'))
    expect(screen.queryByText(/Artikel Penulis: author1/i)).not.toBeInTheDocument()
  })

  it('handles inspect user posts failure and empty user posts', async () => {
    adminApi.getAllUsers.mockResolvedValue({
      status: 'success',
      data: { users: mockUsers },
    })
    adminApi.getAllPosts.mockResolvedValue({
      status: 'success',
      data: { posts: mockPosts },
    })
    adminApi.getUserPosts.mockRejectedValueOnce(new Error('User posts error'))

    render(<AdminDashboard user={{ id: 1, role: 'admin' }} />)

    await waitFor(() => {
      expect(screen.getByText('author1@delcom.org')).toBeInTheDocument()
    })

    fireEvent.click(screen.getAllByRole('button', { name: /Detail/i })[0])

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('User posts error')
    })

    // Inspect user error without message
    adminApi.getUserPosts.mockRejectedValueOnce({})
    fireEvent.click(screen.getAllByRole('button', { name: /Detail/i })[0])
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Gagal memuat artikel pengguna.')
    })

    // Inspect user with 0 posts
    adminApi.getUserPosts.mockResolvedValueOnce({
      status: 'success',
      data: { user: mockUsers[0], posts: [] },
    })

    fireEvent.click(screen.getAllByRole('button', { name: /Detail/i })[0])
    await waitFor(() => {
      expect(screen.getByText(/Belum ada artikel yang dibuat oleh pengguna ini/i)).toBeInTheDocument()
    })
  })

  it('handles error state and refresh', async () => {
    adminApi.getAllUsers.mockRejectedValueOnce({})
    adminApi.getAllPosts.mockResolvedValueOnce({ status: 'success', data: { posts: [] } })

    render(<AdminDashboard user={{ id: 1, role: 'admin' }} />)

    await waitFor(() => {
      expect(screen.getByText('Gagal memuat data panel admin.')).toBeInTheDocument()
    })

    // Click refresh
    adminApi.getAllUsers.mockResolvedValueOnce({ status: 'success', data: { users: [] } })
    adminApi.getAllPosts.mockResolvedValueOnce({ status: 'success', data: { posts: [] } })

    fireEvent.click(screen.getByRole('button', { name: /Segarkan/i }))

    await waitFor(() => {
      expect(screen.queryByText('Gagal memuat data panel admin.')).not.toBeInTheDocument()
    })
  })

  it('handles empty or non-array API responses and null user/posts modal', async () => {
    adminApi.getAllUsers.mockResolvedValueOnce({ status: 'success', data: null })
    adminApi.getAllPosts.mockResolvedValueOnce({ status: 'success', data: null })

    const firstRender = render(<AdminDashboard user={{ id: 1, role: 'admin' }} />)

    await waitFor(() => {
      expect(screen.getByText('Direktori Pengguna (0)')).toBeInTheDocument()
      expect(screen.getByText('Arsip Seluruh Artikel (0)')).toBeInTheDocument()
    })
    firstRender.unmount()

    // Now test null user and null posts in modal
    adminApi.getAllUsers.mockResolvedValueOnce({
      status: 'success',
      data: { users: [{ id: 99, username: 'ghost', email: 'ghost@del.org', role: 'author' }] },
    })
    adminApi.getAllPosts.mockResolvedValueOnce({
      status: 'success',
      data: {
        posts: [{
          id: 99,
          title: 'Post Tanpa Kategori',
          slug: 'ghost-post',
          category: null,
          author: null,
          author_id: 99,
          is_published: true,
          created_at: '2026-11-18T00:00:00Z',
        }],
      },
    })
    adminApi.getUserPosts.mockResolvedValueOnce({
      status: 'success',
      data: { user: null, posts: null },
    })

    const { unmount } = render(<AdminDashboard user={{ id: 1, role: 'admin' }} />)

    await waitFor(() => {
      expect(screen.getByText('ghost@del.org')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Detail/i }))
    await waitFor(() => {
      expect(screen.getByText(/Artikel Penulis: User/i)).toBeInTheDocument()
      expect(screen.getByText(/Total 0 artikel/i)).toBeInTheDocument()
    })

    // Switch to posts tab and click Baca without onNavigate
    fireEvent.click(screen.getByText(/Arsip Seluruh Artikel/i))
    await waitFor(() => {
      expect(screen.getByText('Post Tanpa Kategori')).toBeInTheDocument()
      expect(screen.getByText('Umum')).toBeInTheDocument()
      expect(screen.getByText('ID: 99')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Baca/i }))
    unmount()
  })
})
