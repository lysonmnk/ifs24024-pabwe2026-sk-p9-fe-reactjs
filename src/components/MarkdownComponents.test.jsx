import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { MarkdownEditor } from './MarkdownEditor'
import defaultMarkdownEditor from './MarkdownEditor'
import { MarkdownViewer } from './MarkdownViewer'
import defaultMarkdownViewer from './MarkdownViewer'
import Editor from '@toast-ui/editor'

const mockEditorInstance = {
  getMarkdown: vi.fn().mockReturnValue('mock markdown'),
  setMarkdown: vi.fn(),
  destroy: vi.fn(),
}

vi.mock('@toast-ui/editor', () => {
  const MockEditor = vi.fn().mockImplementation((config) => {
    if (config.events && config.events.change) {
      mockEditorInstance._triggerChange = config.events.change
    }
    return mockEditorInstance
  })
  MockEditor.factory = vi.fn().mockImplementation(() => mockEditorInstance)
  return {
    default: MockEditor,
  }
})

describe('MarkdownComponents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('MarkdownEditor', () => {
    it('renders editor container and initializes Editor', () => {
      const onChange = vi.fn()
      const { unmount } = render(
        <MarkdownEditor
          initialValue="init"
          value="val"
          onChange={onChange}
          height="500px"
          isDark={true}
        />
      )

      expect(screen.getByTestId('markdown-editor')).toBeInTheDocument()
      expect(Editor).toHaveBeenCalledWith(
        expect.objectContaining({
          height: '500px',
          initialEditType: 'markdown',
          previewStyle: 'vertical',
          initialValue: 'val',
          theme: 'dark',
        })
      )

      // trigger change event
      if (mockEditorInstance._triggerChange) {
        mockEditorInstance._triggerChange()
        expect(onChange).toHaveBeenCalledWith('mock markdown')
      }

      // unmount calls destroy
      unmount()
      expect(mockEditorInstance.destroy).toHaveBeenCalled()
    })

    it('handles light theme and initialValue fallback when value is undefined', () => {
      render(<MarkdownEditor initialValue="fallback text" isDark={false} />)
      expect(Editor).toHaveBeenCalledWith(
        expect.objectContaining({
          initialValue: 'fallback text',
          theme: 'default',
        })
      )
    })

    it('updates markdown when value prop changes', () => {
      mockEditorInstance.getMarkdown.mockReturnValue('old value')
      const { rerender } = render(<MarkdownEditor value="old value" />)

      rerender(<MarkdownEditor value="new value" />)
      expect(mockEditorInstance.setMarkdown).toHaveBeenCalledWith('new value')
    })

    it('default export is MarkdownEditor', () => {
      expect(defaultMarkdownEditor).toBe(MarkdownEditor)
    })
  })

  describe('MarkdownViewer', () => {
    it('renders viewer and initializes Editor.factory', () => {
      const { unmount } = render(<MarkdownViewer content="# Hello World" />)
      expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()
      expect(Editor.factory).toHaveBeenCalledWith(
        expect.objectContaining({
          viewer: true,
          initialValue: '# Hello World',
        })
      )

      unmount()
      expect(mockEditorInstance.destroy).toHaveBeenCalled()
    })

    it('updates markdown when content prop changes', () => {
      const { rerender } = render(<MarkdownViewer content="first content" />)
      rerender(<MarkdownViewer content="updated content" />)
      expect(mockEditorInstance.setMarkdown).toHaveBeenCalledWith('updated content')
    })

    it('default export is MarkdownViewer', () => {
      expect(defaultMarkdownViewer).toBe(MarkdownViewer)
    })
  })
})
