import React, { useEffect, useRef } from 'react'
import Editor from '@toast-ui/editor'

export const MarkdownEditor = ({
  initialValue = '',
  value,
  onChange,
  height = '450px',
  previewStyle = 'vertical',
  isDark = false,
}) => {
  const containerRef = useRef(null)
  const editorRef = useRef(null)

  useEffect(() => {
    const editor = new Editor({
      el: containerRef.current,
      height,
      initialEditType: 'markdown',
      previewStyle,
      initialValue: value !== undefined ? value : initialValue,
      theme: isDark ? 'dark' : 'default',
      events: {
        change: () => {
          if (onChange && editorRef.current) {
            onChange(editorRef.current.getMarkdown())
          }
        },
      },
    })

    editorRef.current = editor

    return () => {
      editor.destroy()
      editorRef.current = null
    }
  }, [isDark])

  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      if (editorRef.current.getMarkdown() !== value) {
        editorRef.current.setMarkdown(value)
      }
    }
  }, [value])

  return <div ref={containerRef} className="toastui-editor-wrapper w-full" data-testid="markdown-editor" />
}

export default MarkdownEditor
