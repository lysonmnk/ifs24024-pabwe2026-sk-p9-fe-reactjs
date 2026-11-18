import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { App } from './App'
import defaultApp from './App'
import * as apiHelper from './helpers/apiHelper'
import * as toolsHelper from './helpers/toolsHelper'

vi.mock('./features/blog/components/PublicArticleList', () => ({
  PublicArticleList: ({ onSelectArticle, onNavigate }) => (
    <div data-testid="mock-public-list">
      <button onClick={() => onSelectArticle({ slug: 'artikel-pertama', title: 'Judul 1' })}>
        Pilih Artikel
      </button>
      <button onClick={() => onNavigate('/login')}>Ke Login</button>
      <button onClick={() => onNavigate('/register')}>Ke Register</button>
      <button onClick={() => onNavigate('/author')}>Ke Author</button>
      <button onClick={() => onNavigate('/admin')}>Ke Admin</button>
    </div>
  ),
}))

vi.mock('./features/blog/components/PublicArticleDetail', () => ({
  PublicArticleDetail: ({ slug, onBack }) => (
    <div data-testid="mock-public-detail">
      <span>Detail: {slug}</span>
      <button onClick={onBack}>Kembali Detail</button>
    </div>
  ),
}))

vi.mock('./features/blog/components/AuthorDashboard', () => ({
  AuthorDashboard: ({ user, onNavigate }) => (
    <div data-testid="mock-author-dashboard">
      <span>Workspace: {user ? user.username : 'no-user'}</span>
      <button onClick={() => onNavigate('/')}>Ke Home</button>
    </div>
  ),
}))

vi.mock('./features/admin/components/AdminDashboard', () => ({
  AdminDashboard: ({ user, onNavigate }) => (
    <div data-testid="mock-admin-dashboard">
      <span>Admin: {user ? user.username : 'no-user'}</span>
      <button onClick={() => onNavigate('/')}>Ke Home</button>
    </div>
  ),
}))

vi.mock('./features/auth/components/AuthPage', () => ({
  AuthPage: ({ mode, onAuthSuccess }) => (
    <div data-testid="mock-auth-page">
      <span>Mode: {mode}</span>
      <button
        onClick={() =>
          onAuthSuccess({ id: 1, username: 'penulis1', role: 'author' })
        }
      >
        Sukses Login Author
      </button>
      <button
        onClick={() =>
          onAuthSuccess({ id: 2, username: 'admin1', role: 'admin' })
        }
      >
        Sukses Login Admin
      </button>
    </div>
  ),
}))

vi.mock('./features/auth/modals/AuthModal', () => ({
  AuthModal: ({ isOpen, onClose, onSuccess }) =>
    isOpen ? (
      <div data-testid="mock-auth-modal">
        <button onClick={onClose}>Tutup Modal</button>
        <button onClick={() => onSuccess({ id: 3, username: 'modaluser', role: 'author' })}>
          Sukses Modal
        </button>
      </div>
    ) : null,
}))

vi.mock('./helpers/toolsHelper', () => ({
  showToast: vi.fn(),
}))

vi.mock('./helpers/apiHelper', () => ({
  getUser: vi.fn().mockReturnValue(null),
  removeToken: vi.fn(),
  removeUser: vi.fn(),
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.history.pushState({}, '', '/')
    window.scrollTo = vi.fn()
  })

  it('renders home page and navigates through popstate and clicks', () => {
    render(<App />)

    expect(screen.getByTestId('mock-public-list')).toBeInTheDocument()
    expect(defaultApp).toBe(App)

    // Navigate to post detail
    fireEvent.click(screen.getByRole('button', { name: /Pilih Artikel/i }))
    expect(screen.getByTestId('mock-public-detail')).toBeInTheDocument()
    expect(screen.getByText('Detail: artikel-pertama')).toBeInTheDocument()

    // Back from detail
    fireEvent.click(screen.getByRole('button', { name: /Kembali Detail/i }))
    expect(screen.getByTestId('mock-public-list')).toBeInTheDocument()

    // Popstate simulation
    act(() => {
      window.history.pushState({}, '', '/posts/artikel-dua')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.getByText('Detail: artikel-dua')).toBeInTheDocument()
  })

  it('handles guest attempting to access /author and /admin', () => {
    apiHelper.getUser.mockReturnValue(null)

    render(<App />)

    // Click Ke Author
    fireEvent.click(screen.getByRole('button', { name: /Ke Author/i }))
    expect(screen.getByTestId('mock-auth-page')).toBeInTheDocument()
    expect(screen.getByText('Mode: login')).toBeInTheDocument()

    // Author Login success transitions to author dashboard
    fireEvent.click(screen.getByRole('button', { name: /Sukses Login Author/i }))
    expect(screen.getByTestId('mock-author-dashboard')).toBeInTheDocument()

    // Attempting to access admin as author redirects to login AuthPage
    act(() => {
      window.history.pushState({}, '', '/admin')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(screen.getByTestId('mock-auth-page')).toBeInTheDocument()

    // Admin Login success transitions to admin dashboard
    fireEvent.click(screen.getByRole('button', { name: /Sukses Login Admin/i }))
    expect(screen.getByTestId('mock-admin-dashboard')).toBeInTheDocument()
  })

  it('handles direct route to /login and /register', () => {
    window.history.pushState({}, '', '/login')
    const { unmount } = render(<App />)
    expect(screen.getByTestId('mock-auth-page')).toBeInTheDocument()
    expect(screen.getByText('Mode: login')).toBeInTheDocument()
    unmount()

    window.history.pushState({}, '', '/register')
    render(<App />)
    expect(screen.getByTestId('mock-auth-page')).toBeInTheDocument()
    expect(screen.getByText('Mode: register')).toBeInTheDocument()
  })

  it('handles AuthModal trigger and success from navbar', () => {
    render(<App />)

    // Click Masuk on navbar
    fireEvent.click(screen.getByRole('button', { name: /Masuk/i }))
    expect(screen.getByTestId('mock-auth-modal')).toBeInTheDocument()

    // Close modal
    fireEvent.click(screen.getByRole('button', { name: /Tutup Modal/i }))
    expect(screen.queryByTestId('mock-auth-modal')).not.toBeInTheDocument()

    // Reopen and complete auth
    fireEvent.click(screen.getByRole('button', { name: /Masuk/i }))
    fireEvent.click(screen.getByRole('button', { name: /Sukses Modal/i }))
    expect(screen.getByTestId('mock-author-dashboard')).toBeInTheDocument()
  })

  it('handles logout flow', () => {
    apiHelper.getUser.mockReturnValue({ id: 1, username: 'user1', role: 'author' })
    render(<App />)

    // Logout button on navbar
    fireEvent.click(screen.getByTitle('Keluar'))
    expect(apiHelper.removeToken).toHaveBeenCalled()
    expect(apiHelper.removeUser).toHaveBeenCalled()
    expect(toolsHelper.showToast).toHaveBeenCalledWith('Berhasil keluar dari akun.')
    expect(screen.getByTestId('mock-public-list')).toBeInTheDocument()
  })

  it('handles search input from navbar', () => {
    render(<App />)
    const searchInputs = screen.getAllByPlaceholderText(/Cari artikel/i)
    fireEvent.change(searchInputs[0], { target: { value: 'tutorial' } })
    expect(searchInputs[0].value).toBe('tutorial')
  })
})
