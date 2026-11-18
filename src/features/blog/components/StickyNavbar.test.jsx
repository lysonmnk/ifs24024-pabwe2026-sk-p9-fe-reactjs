import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { StickyNavbar } from './StickyNavbar'
import defaultStickyNavbar from './StickyNavbar'

describe('StickyNavbar', () => {
  it('renders guest navbar with brand, search, theme toggle, and auth buttons', () => {
    const onNavigate = vi.fn()
    const onSearchChange = vi.fn()
    const onToggleTheme = vi.fn()
    const onOpenAuth = vi.fn()

    render(
      <StickyNavbar
        searchTerm="test"
        onSearchChange={onSearchChange}
        theme="light"
        onToggleTheme={onToggleTheme}
        onNavigate={onNavigate}
        onOpenAuth={onOpenAuth}
      />
    )

    // Brand click
    fireEvent.click(screen.getByText(/Delcom/i))
    expect(onNavigate).toHaveBeenCalledWith('/')

    // Search change
    const searchInputs = screen.getAllByPlaceholderText(/Cari artikel/i)
    fireEvent.change(searchInputs[0], { target: { value: 'golang' } })
    expect(onSearchChange).toHaveBeenCalledWith('golang')
    fireEvent.change(searchInputs[1], { target: { value: 'react' } })
    expect(onSearchChange).toHaveBeenCalledWith('react')

    // Theme toggle
    fireEvent.click(screen.getByTitle(/Ubah Tema/i))
    expect(onToggleTheme).toHaveBeenCalled()

    // Auth actions
    fireEvent.click(screen.getByRole('button', { name: /Masuk/i }))
    expect(onOpenAuth).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /Daftar/i }))
    expect(onNavigate).toHaveBeenCalledWith('/register')

    expect(defaultStickyNavbar).toBe(StickyNavbar)
  })

  it('handles brand click when onNavigate is omitted', () => {
    render(<StickyNavbar />)
    fireEvent.click(screen.getByText(/Delcom/i))
    // should not throw
  })

  it('navigates to /login if onOpenAuth is not provided', () => {
    const onNavigate = vi.fn()
    render(<StickyNavbar onNavigate={onNavigate} />)

    fireEvent.click(screen.getByRole('button', { name: /Masuk/i }))
    expect(onNavigate).toHaveBeenCalledWith('/login')
  })

  it('renders dark theme icon properly', () => {
    render(<StickyNavbar theme="dark" />)
    expect(screen.getByTitle(/Ubah Tema/i)).toBeInTheDocument()
  })

  it('renders authenticated user navbar with author role', () => {
    const authorUser = { id: 1, username: 'penulis1', role: 'author' }
    const onNavigate = vi.fn()
    const onLogout = vi.fn()

    render(
      <StickyNavbar
        user={authorUser}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
    )

    expect(screen.getByText('penulis1')).toBeInTheDocument()
    expect(screen.getByText('author')).toBeInTheDocument()

    // Workspace button
    fireEvent.click(screen.getByTitle('Workspace Penulis'))
    expect(onNavigate).toHaveBeenCalledWith('/author')

    // Admin button should NOT be present
    expect(screen.queryByTitle('Admin Panel')).not.toBeInTheDocument()

    // Logout
    fireEvent.click(screen.getByTitle('Keluar'))
    expect(onLogout).toHaveBeenCalled()
  })

  it('renders admin button when user has admin role', () => {
    const adminUser = { id: 2, username: 'admin1', role: 'admin' }
    const onNavigate = vi.fn()

    render(<StickyNavbar user={adminUser} onNavigate={onNavigate} />)

    const adminBtn = screen.getByTitle('Admin Panel')
    expect(adminBtn).toBeInTheDocument()
    fireEvent.click(adminBtn)
    expect(onNavigate).toHaveBeenCalledWith('/admin')
  })
})
