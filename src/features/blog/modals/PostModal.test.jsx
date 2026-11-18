import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PostModal } from './PostModal'
import defaultPostModal from './PostModal'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../../../helpers/toolsHelper', () => ({
  showAlert: vi.fn(),
}))

vi.mock('../../../components/MarkdownEditor', () => ({
  MarkdownEditor: ({ value, onChange }) => (
    <textarea
      data-testid="mock-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

describe('PostModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<PostModal isOpen={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders modal with required fields when isOpen is true', () => {
    render(<PostModal isOpen={true} />)
    expect(screen.getByTestId('post-modal')).toBeInTheDocument()
    expect(screen.getByText('Tulis Artikel Baru')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Contoh: Menguasai Golang Gin/i)).toBeInTheDocument()
    expect(defaultPostModal).toBe(PostModal)
  })

  it('calls onClose when close icon or Batal button is clicked', () => {
    const onClose = vi.fn()
    render(<PostModal isOpen={true} onClose={onClose} />)

    fireEvent.click(screen.getByLabelText(/Tutup/i))
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /Batal/i }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('validates short title and empty content', () => {
    render(<PostModal isOpen={true} />)

    // Empty title
    fireEvent.click(screen.getByRole('button', { name: /Simpan/i }))
    expect(toolsHelper.showAlert).toHaveBeenCalledWith('Peringatan', expect.any(String), 'warning')

    // Valid title, empty content
    fireEvent.change(screen.getByPlaceholderText(/Contoh: Menguasai Golang Gin/i), {
      target: { value: 'Judul Valid' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Simpan/i }))
    expect(toolsHelper.showAlert).toHaveBeenCalledWith('Peringatan', expect.any(String), 'warning')
  })

  it('submits valid data successfully and closes', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ status: 'success' })
    const onClose = vi.fn()

    render(<PostModal isOpen={true} onSubmit={onSubmit} onClose={onClose} />)

    fireEvent.change(screen.getByPlaceholderText(/Contoh: Menguasai Golang Gin/i), {
      target: { value: 'Panduan Arsitektur' },
    })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Pendidikan' } })
    fireEvent.change(screen.getByPlaceholderText(/golang, gin, react/i), {
      target: { value: 'arsitektur, modular' },
    })
    fireEvent.change(screen.getByPlaceholderText(/https:\/\/images\.unsplash\.com/i), {
      target: { value: 'https://example.com/pic.png' },
    })
    fireEvent.change(screen.getByTestId('mock-editor'), {
      target: { value: 'Konten komprehensif...' },
    })
    fireEvent.click(screen.getByRole('checkbox'))

    fireEvent.click(screen.getByRole('button', { name: /Simpan/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Panduan Arsitektur',
        category: 'Pendidikan',
        tags: 'arsitektur, modular',
        cover_image: 'https://example.com/pic.png',
        content: 'Konten komprehensif...',
        is_published: true,
      })
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('handles edit mode with initialData and submission error', async () => {
    const initialData = {
      title: 'Artikel Lama',
      category: 'Bisnis',
      tags: 'bisnis',
      cover_image: 'https://example.com/old.jpg',
      content: 'Isi lama...',
      is_published: true,
    }
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error('Gagal simpan'))

    render(<PostModal isOpen={true} initialData={initialData} onSubmit={onSubmit} />)

    expect(screen.getByText('Perbarui Artikel')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Artikel Lama')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Simpan/i }))

    await waitFor(() => {
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Gagal', 'Gagal simpan', 'error')
    })

    // Error without message and without onClose
    onSubmit.mockRejectedValueOnce({})
    fireEvent.click(screen.getByRole('button', { name: /Simpan/i }))
    await waitFor(() => {
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Gagal', 'Terjadi kesalahan saat menyimpan artikel.', 'error')
    })
  })

  it('handles initialData with empty/missing properties', () => {
    render(<PostModal isOpen={true} initialData={{}} />)
    expect(screen.getByText('Perbarui Artikel')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Contoh: Menguasai Golang Gin/i).value).toBe('')
    expect(screen.getByRole('combobox').value).toBe('Teknologi')
  })
})
