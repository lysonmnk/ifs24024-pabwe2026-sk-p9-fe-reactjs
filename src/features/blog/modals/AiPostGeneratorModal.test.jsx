import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AiPostGeneratorModal } from './AiPostGeneratorModal'
import defaultAiPostGeneratorModal from './AiPostGeneratorModal'
import * as blogApi from '../api/blogApi'
import * as toolsHelper from '../../../helpers/toolsHelper'

vi.mock('../api/blogApi', () => ({
  generateAiPost: vi.fn(),
}))

vi.mock('../../../helpers/toolsHelper', () => ({
  showAlert: vi.fn(),
}))

vi.mock('../../../components/MarkdownViewer', () => ({
  MarkdownViewer: ({ content }) => <div data-testid="mock-preview">{content}</div>,
}))

describe('AiPostGeneratorModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<AiPostGeneratorModal isOpen={false} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders modal with required controls when isOpen is true', () => {
    render(<AiPostGeneratorModal isOpen={true} />)
    expect(screen.getByTestId('ai-post-generator-modal')).toBeInTheDocument()
    expect(screen.getByText('AI Blog Generator')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Contoh: Manfaat Mempelajari Pemrograman Golang/i)).toBeInTheDocument()
    expect(defaultAiPostGeneratorModal).toBe(AiPostGeneratorModal)
  })

  it('calls onClose when close icon or Batal is clicked', () => {
    const onClose = vi.fn()
    render(<AiPostGeneratorModal isOpen={true} onClose={onClose} />)

    fireEvent.click(screen.getByLabelText(/Tutup/i))
    expect(onClose).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: /Batal/i }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('validates short or empty prompt', () => {
    render(<AiPostGeneratorModal isOpen={true} />)
    fireEvent.click(screen.getByRole('button', { name: /Generate/i }))
    expect(toolsHelper.showAlert).toHaveBeenCalledWith('Peringatan', expect.any(String), 'warning')
  })

  it('generates draft successfully and applies it', async () => {
    const mockDraft = {
      title: 'Artikel Dihasilkan AI',
      category: 'Teknologi',
      tags: 'ai, golang',
      content: '# Konten AI',
      reading_time: 3,
      citations: [
        'https://golang.org',
        { title: 'Gin Docs', url: 'https://gin-gonic.com' },
      ],
    }
    blogApi.generateAiPost.mockResolvedValueOnce({
      status: 'success',
      data: mockDraft,
    })

    const onApplyDraft = vi.fn()
    const onClose = vi.fn()

    render(
      <AiPostGeneratorModal
        isOpen={true}
        onClose={onClose}
        onApplyDraft={onApplyDraft}
      />
    )

    // Toggle search checkbox off and on
    const searchCheckbox = screen.getByRole('checkbox')
    fireEvent.click(searchCheckbox)
    expect(searchCheckbox.checked).toBe(false)
    fireEvent.click(searchCheckbox)
    expect(searchCheckbox.checked).toBe(true)

    // Input prompt and generate
    fireEvent.change(
      screen.getByPlaceholderText(/Contoh: Manfaat Mempelajari Pemrograman Golang/i),
      { target: { value: 'Inovasi AI 2026' } }
    )
    fireEvent.click(screen.getByRole('button', { name: /Generate/i }))

    await waitFor(() => {
      expect(blogApi.generateAiPost).toHaveBeenCalledWith('Inovasi AI 2026', true)
      expect(screen.getByText('Artikel Dihasilkan AI')).toBeInTheDocument()
      expect(screen.getByText('https://golang.org')).toBeInTheDocument()
      expect(screen.getByText('Gin Docs')).toBeInTheDocument()
      expect(screen.getByTestId('mock-preview')).toHaveTextContent('# Konten AI')
    })

    // Apply draft
    fireEvent.click(screen.getByRole('button', { name: /Gunakan Draf Ini/i }))
    expect(onApplyDraft).toHaveBeenCalledWith(mockDraft)
    expect(onClose).toHaveBeenCalled()
  })

  it('handles invalid response data', async () => {
    blogApi.generateAiPost.mockResolvedValueOnce({ status: 'fail', data: null })
    render(<AiPostGeneratorModal isOpen={true} />)

    fireEvent.change(
      screen.getByPlaceholderText(/Contoh: Manfaat Mempelajari Pemrograman Golang/i),
      { target: { value: 'Inovasi AI 2026' } }
    )
    fireEvent.click(screen.getByRole('button', { name: /Generate/i }))

    await waitFor(() => {
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Gagal', 'Respons dari AI tidak valid.', 'error')
    })
  })

  it('handles generation error', async () => {
    blogApi.generateAiPost.mockRejectedValueOnce(new Error('Rate limit AI'))
    render(<AiPostGeneratorModal isOpen={true} />)

    fireEvent.change(
      screen.getByPlaceholderText(/Contoh: Manfaat Mempelajari Pemrograman Golang/i),
      { target: { value: 'Inovasi AI 2026' } }
    )
    fireEvent.click(screen.getByRole('button', { name: /Generate/i }))

    await waitFor(() => {
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Gagal', 'Rate limit AI', 'error')
    })

    // Test error without message
    blogApi.generateAiPost.mockRejectedValueOnce({})
    fireEvent.click(screen.getByRole('button', { name: /Generate/i }))
    await waitFor(() => {
      expect(toolsHelper.showAlert).toHaveBeenCalledWith('Gagal', 'Terjadi kesalahan saat memanggil asisten AI.', 'error')
    })
  })

  it('handles draft without category/reading_time and citation with only url', async () => {
    const minimalDraft = {
      title: 'Draft Minimal',
      category: '',
      tags: null,
      reading_time: 0,
      content: 'Isi teks',
      citations: [{ url: 'https://only-url.com' }],
    }
    blogApi.generateAiPost.mockResolvedValueOnce({ status: 'success', data: minimalDraft })

    render(<AiPostGeneratorModal isOpen={true} />)

    fireEvent.change(
      screen.getByPlaceholderText(/Contoh: Manfaat Mempelajari Pemrograman Golang/i),
      { target: { value: 'Topik Baru' } }
    )
    fireEvent.click(screen.getByRole('button', { name: /Generate/i }))

    await waitFor(() => {
      expect(screen.getByText('Kategori: Umum')).toBeInTheDocument()
      expect(screen.getByText(/Estimasi 1 menit baca/i)).toBeInTheDocument()
      expect(screen.getByText('https://only-url.com')).toBeInTheDocument()
    })

    // Click apply without callbacks passed
    fireEvent.click(screen.getByRole('button', { name: /Gunakan Draf Ini/i }))
  })
})
