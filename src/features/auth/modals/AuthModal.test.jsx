import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthModal } from './AuthModal'
import defaultAuthModal from './AuthModal'
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

describe('AuthModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<AuthModal isOpen={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders modal with mandatory IDs when isOpen is true', () => {
    render(<AuthModal isOpen={true} />)
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
    expect(screen.getByLabelText(/Username/i)).toHaveAttribute('id', 'login-username')
    expect(screen.getByLabelText(/Password/i)).toHaveAttribute('id', 'login-password')
    expect(screen.getByRole('button', { name: /Masuk/i })).toHaveAttribute('id', 'login-submit')
    expect(defaultAuthModal).toBe(AuthModal)
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<AuthModal isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText(/Tutup/i))
    expect(onClose).toHaveBeenCalled()
  })

  it('validates required fields', () => {
    render(<AuthModal isOpen={true} />)
    const form = screen.getByRole('button', { name: /Masuk/i }).closest('form')
    fireEvent.submit(form)
    expect(toolsHelper.showAlert).toHaveBeenCalledWith('Peringatan', expect.any(String), 'warning')
  })

  it('handles successful login and calls onSuccess and onClose', async () => {
    const mockUser = { id: 1, username: 'testuser' }
    authApi.loginUser.mockResolvedValueOnce({
      status: 'success',
      data: { token: 'tok', user: mockUser },
    })

    const onSuccess = vi.fn()
    const onClose = vi.fn()
    render(<AuthModal isOpen={true} onSuccess={onSuccess} onClose={onClose} />)

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /Masuk/i }))

    await waitFor(() => {
      expect(authApi.loginUser).toHaveBeenCalledWith({ username: 'testuser', password: 'secret' })
      expect(onSuccess).toHaveBeenCalledWith(mockUser)
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('handles login failure', async () => {
    authApi.loginUser.mockRejectedValueOnce(new Error('Login error'))
    render(<AuthModal isOpen={true} />)

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'u' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'p' } })
    fireEvent.click(screen.getByRole('button', { name: /Masuk/i }))
    await waitFor(() => {
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Gagal', 'Login error', 'error')
    })

    // Test error without message
    authApi.loginUser.mockRejectedValueOnce({})
    fireEvent.click(screen.getByRole('button', { name: /Masuk/i }))
    await waitFor(() => {
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Gagal', 'Terjadi kesalahan saat memproses permintaan.', 'error')
    })
  })

  it('handles registration workflow and error', async () => {
    authApi.registerUser.mockResolvedValueOnce({ status: 'success' })
    render(<AuthModal isOpen={true} />)

    // Switch to register
    fireEvent.click(screen.getByRole('button', { name: /Daftar sekarang/i }))
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()

    // Submit registration
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'newu' } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'new@del.org' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'p' } })
    fireEvent.click(screen.getByRole('button', { name: /Daftar Sekarang/i }))

    await waitFor(() => {
      expect(authApi.registerUser).toHaveBeenCalled()
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Sukses', expect.any(String), 'success')
    })

    // Switch back to register, fail registration
    fireEvent.click(screen.getByRole('button', { name: /Daftar sekarang/i }))
    authApi.registerUser.mockRejectedValueOnce(new Error('Fail reg'))
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'newu' } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'new@del.org' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'p' } })
    fireEvent.click(screen.getByRole('button', { name: /Daftar Sekarang/i }))

    await waitFor(() => {
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Gagal', 'Fail reg', 'error')
    })

    // switch back to login
    fireEvent.click(screen.getByRole('button', { name: /Masuk di sini/i }))
    expect(screen.queryByLabelText(/Email/i)).not.toBeInTheDocument()
  })
})
