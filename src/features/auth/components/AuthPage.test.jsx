import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthPage } from './AuthPage'
import defaultAuthPage from './AuthPage'
import * as authApi from '../api/authApi'
import * as toolsHelper from '../../../helpers/toolsHelper'
import * as apiHelper from '../../../helpers/apiHelper'

vi.mock('../api/authApi', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}))

vi.mock('../../../helpers/toolsHelper', () => ({
  showAlert: vi.fn(),
  showToast: vi.fn(),
}))

vi.mock('../../../helpers/apiHelper', () => ({
  setToken: vi.fn(),
  setUser: vi.fn(),
}))

describe('AuthPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders login page with mandatory IDs', () => {
    render(<AuthPage mode="login" />)

    expect(screen.getByLabelText(/Username/i)).toHaveAttribute('id', 'login-username')
    expect(screen.getByLabelText(/Password/i)).toHaveAttribute('id', 'login-password')
    expect(screen.getByRole('button', { name: /Masuk/i })).toHaveAttribute('id', 'login-submit')
    expect(defaultAuthPage).toBe(AuthPage)
  })

  it('validates empty inputs on submit', async () => {
    render(<AuthPage mode="login" />)

    const form = screen.getByRole('button', { name: /Masuk/i }).closest('form')
    fireEvent.submit(form)

    expect(toolsHelper.showAlert).toHaveBeenCalledWith(
      'Peringatan',
      'Harap isi semua bidang formulir.',
      'warning'
    )
  })

  it('submits login successfully and calls onAuthSuccess', async () => {
    const mockUser = { id: 1, username: 'testuser', role: 'author' }
    authApi.loginUser.mockResolvedValueOnce({
      status: 'success',
      data: { token: 'jwt-token', user: mockUser },
    })

    const onAuthSuccess = vi.fn()
    render(<AuthPage mode="login" onAuthSuccess={onAuthSuccess} />)

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret' } })
    const form = screen.getByRole('button', { name: /Masuk/i }).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(authApi.loginUser).toHaveBeenCalledWith({ username: 'testuser', password: 'secret' })
      expect(apiHelper.setToken).toHaveBeenCalledWith('jwt-token')
      expect(apiHelper.setUser).toHaveBeenCalledWith(mockUser)
      expect(toolsHelper.showToast).toHaveBeenCalledWith('Berhasil masuk!')
      expect(onAuthSuccess).toHaveBeenCalledWith(mockUser)
    })
  })

  it('submits login and navigates based on role when onAuthSuccess is not provided', async () => {
    const adminUser = { id: 2, username: 'admin', role: 'admin' }
    authApi.loginUser.mockResolvedValueOnce({
      status: 'success',
      data: { token: 'admin-token', user: adminUser },
    })

    const onNavigate = vi.fn()
    render(<AuthPage mode="login" onNavigate={onNavigate} />)

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'admin' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'adminpass' } })
    const form = screen.getByRole('button', { name: /Masuk/i }).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith('/admin')
    })

    // Test author role navigation
    const authorUser = { id: 3, username: 'author', role: 'author' }
    authApi.loginUser.mockResolvedValueOnce({
      status: 'success',
      data: { token: 'author-token', user: authorUser },
    })
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'author' } })
    fireEvent.submit(form)
    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith('/author')
    })
  })

  it('handles login failure with and without error message', async () => {
    authApi.loginUser.mockRejectedValueOnce(new Error('Kredensial tidak valid'))

    render(<AuthPage mode="login" />)

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'wronguser' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } })
    const form = screen.getByRole('button', { name: /Masuk/i }).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Gagal', 'Kredensial tidak valid', 'error')
    })

    // Test error without message
    authApi.loginUser.mockRejectedValueOnce({})
    fireEvent.submit(form)
    await waitFor(() => {
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Gagal', 'Terjadi kesalahan saat memproses permintaan.', 'error')
    })
  })

  it('toggles to register mode and registers successfully', async () => {
    authApi.registerUser.mockResolvedValueOnce({ status: 'success' })

    render(<AuthPage mode="login" />)

    // Switch to register
    fireEvent.click(screen.getByRole('button', { name: /Daftar di sini/i }))
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()

    // Submit with empty email
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'newuser' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass123' } })
    const form = screen.getByRole('button', { name: /Daftar Sekarang/i }).closest('form')
    fireEvent.submit(form)
    expect(toolsHelper.showAlert).toHaveBeenCalledWith('Peringatan', expect.any(String), 'warning')

    // Submit with valid email
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'new@delcom.org' } })
    fireEvent.submit(form)

    await waitFor(() => {
      expect(authApi.registerUser).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@delcom.org',
        password: 'pass123',
      })
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Sukses', expect.any(String), 'success')
    })
  })

  it('handles register failure', async () => {
    authApi.registerUser.mockRejectedValueOnce(new Error('Email sudah terdaftar'))

    render(<AuthPage mode="register" />)

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'user' } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'used@delcom.org' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass' } })
    const form = screen.getByRole('button', { name: /Daftar Sekarang/i }).closest('form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Gagal', 'Email sudah terdaftar', 'error')
    })

    // switch back to login
    fireEvent.click(screen.getByRole('button', { name: /Masuk di sini/i }))
    expect(screen.queryByLabelText(/Email/i)).not.toBeInTheDocument()
  })
})
